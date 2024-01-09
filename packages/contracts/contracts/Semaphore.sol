// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {ISemaphore} from "./interfaces/ISemaphore.sol";
import {ISemaphoreVerifier} from "./interfaces/ISemaphoreVerifier.sol";
import {SemaphoreGroups} from "./base/SemaphoreGroups.sol";

/// @title Semaphore
/// @dev This contract uses the Semaphore base contracts to provide a complete service
/// to allow admins to create and manage groups and their members to generate Semaphore proofs
/// and verify them. Group admins can add, update or remove group members, and can be
/// an Ethereum account or a smart contract. This contract also assigns each new Merkle tree
/// generated with a new root a duration (or an expiry) within which the proofs generated with that root
/// can be validated.
contract Semaphore is ISemaphore, SemaphoreGroups {
    ISemaphoreVerifier public verifier;

    /// @dev Gets a group id and returns the group parameters.
    mapping(uint256 => Group) public groups;

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier address.
    constructor(ISemaphoreVerifier _verifier) {
        verifier = _verifier;
    }

    /// @dev See {SemaphoreGroups-_createGroup}.
    function createGroup(uint256 groupId, address admin) external override {
        _createGroup(groupId, admin);

        groups[groupId].merkleTreeDuration = 1 hours;
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(uint256 groupId, address admin, uint256 merkleTreeDuration) external override {
        _createGroup(groupId, admin);

        groups[groupId].merkleTreeDuration = merkleTreeDuration;
    }

    /// @dev See {SemaphoreGroups-_updateGroupAdmin}.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override {
        _updateGroupAdmin(groupId, newAdmin);
    }

    /// @dev See {ISemaphore-updateGroupMerkleTreeDuration}.
    function updateGroupMerkleTreeDuration(
        uint256 groupId,
        uint256 newMerkleTreeDuration
    ) external override onlyExistingGroup(groupId) onlyGroupAdmin(groupId) {
        uint256 oldMerkleTreeDuration = groups[groupId].merkleTreeDuration;

        groups[groupId].merkleTreeDuration = newMerkleTreeDuration;

        emit GroupMerkleTreeDurationUpdated(groupId, oldMerkleTreeDuration, newMerkleTreeDuration);
    }

    /// @dev See {SemaphoreGroups-_addMember}.
    function addMember(uint256 groupId, uint256 identityCommitment) external override {
        _addMember(groupId, identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_addMembers}.
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external override {
        _addMembers(groupId, identityCommitments);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_updateMember}.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        _updateMember(groupId, identityCommitment, newIdentityCommitment, merkleProofSiblings);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_removeMember}.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        _removeMember(groupId, identityCommitment, merkleProofSiblings);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 message,
        uint256 scope,
        uint256[8] calldata proof
    ) external override onlyExistingGroup(groupId) {
        uint256 merkleTreeSize = getMerkleTreeSize(groupId);

        if (merkleTreeSize == 0) {
            revert Semaphore__GroupHasNoMembers();
        }

        uint256 currentMerkleTreeRoot = getMerkleTreeRoot(groupId);

        // A proof could have used an old Merkle tree root.
        // https://github.com/semaphore-protocol/semaphore/issues/98
        if (merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 merkleRootCreationDate = groups[groupId].merkleRootCreationDates[merkleTreeRoot];
            uint256 merkleTreeDuration = groups[groupId].merkleTreeDuration;

            if (merkleRootCreationDate == 0) {
                revert Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > merkleRootCreationDate + merkleTreeDuration) {
                revert Semaphore__MerkleTreeRootIsExpired();
            }
        }

        if (groups[groupId].nullifiers[nullifier]) {
            revert Semaphore__YouAreUsingTheSameNillifierTwice();
        }

        if (
            !verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                [merkleTreeRoot, nullifier, _hash(message), _hash(scope)]
            )
        ) {
            revert Semaphore__InvalidProof();
        }

        groups[groupId].nullifiers[nullifier] = true;

        emit ProofVerified(groupId, merkleTreeRoot, nullifier, message, scope, proof);
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}
