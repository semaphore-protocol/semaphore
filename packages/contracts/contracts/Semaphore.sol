// SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

import {ISemaphore} from "./interfaces/ISemaphore.sol";
import {ISemaphoreVerifier} from "./interfaces/ISemaphoreVerifier.sol";
import {SemaphoreGroups} from "./base/SemaphoreGroups.sol";
import {MIN_DEPTH, MAX_DEPTH} from "./base/Constants.sol";

/// @title Semaphore
/// @dev This contract uses the Semaphore base contracts to provide a complete service
/// to allow admins to create and manage groups and their members to verify Semaphore proofs
/// Group admins can add, update or remove group members, and can be an Ethereum account or a smart contract.
/// This contract also assigns each new Merkle tree generated with a new root a duration (or an expiry)
/// within which the proofs generated with that root can be validated.
contract Semaphore is ISemaphore, SemaphoreGroups {
    ISemaphoreVerifier public verifier;

    /// @dev Gets a group id and returns the group parameters.
    mapping(uint256 => Group) public groups;

    /// @dev Counter to assign an incremental id to the groups.
    /// This counter is used to keep track of the number of groups created.
    uint256 public groupCounter;

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier addresse.
    constructor(ISemaphoreVerifier _verifier) {
        verifier = _verifier;
    }

    /// @dev See {SemaphoreGroups-_createGroup}.
    function createGroup() external override returns (uint256 groupId) {
        groupId = groupCounter++;
        _createGroup(groupId, msg.sender);

        groups[groupId].merkleTreeDuration = 1 hours;
    }

    /// @dev See {SemaphoreGroups-_createGroup}.
    function createGroup(address admin) external override returns (uint256 groupId) {
        groupId = groupCounter++;
        _createGroup(groupId, admin);

        groups[groupId].merkleTreeDuration = 1 hours;
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(address admin, uint256 merkleTreeDuration) external override returns (uint256 groupId) {
        groupId = groupCounter++;
        _createGroup(groupId, admin);

        groups[groupId].merkleTreeDuration = merkleTreeDuration;
    }

    /// @dev See {SemaphoreGroups-_updateGroupAdmin}.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override {
        _updateGroupAdmin(groupId, newAdmin);
    }

    /// @dev See {SemaphoreGroups- acceptGroupAdmin}.
    function acceptGroupAdmin(uint256 groupId) external override {
        _acceptGroupAdmin(groupId);
    }

    /// @dev See {ISemaphore-updateGroupMerkleTreeDuration}.
    function updateGroupMerkleTreeDuration(
        uint256 groupId,
        uint256 newMerkleTreeDuration
    ) external override onlyGroupAdmin(groupId) {
        uint256 oldMerkleTreeDuration = groups[groupId].merkleTreeDuration;

        groups[groupId].merkleTreeDuration = newMerkleTreeDuration;

        emit GroupMerkleTreeDurationUpdated(groupId, oldMerkleTreeDuration, newMerkleTreeDuration);
    }

    /// @dev See {SemaphoreGroups-_addMember}.
    function addMember(uint256 groupId, uint256 identityCommitment) external override {
        uint256 merkleTreeRoot = _addMember(groupId, identityCommitment);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_addMembers}.
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external override {
        uint256 merkleTreeRoot = _addMembers(groupId, identityCommitments);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_updateMember}.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        uint256 merkleTreeRoot = _updateMember(groupId, identityCommitment, newIdentityCommitment, merkleProofSiblings);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {SemaphoreGroups-_removeMember}.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        uint256 merkleTreeRoot = _removeMember(groupId, identityCommitment, merkleProofSiblings);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-validateProof}.
    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external override {
        // The function will revert if the nullifier that is part of the proof,
        // was already used inside the group with id groupId.
        if (groups[groupId].nullifiers[proof.nullifier]) {
            revert Semaphore__YouAreUsingTheSameNullifierTwice();
        }

        // The function will revert if the proof is not verified successfully.
        if (!verifyProof(groupId, proof)) {
            revert Semaphore__InvalidProof();
        }

        // Saves the nullifier so that it cannot be used again to successfully verify a proof
        // that is part of the group with id groupId.
        groups[groupId].nullifiers[proof.nullifier] = true;

        emit ProofValidated(
            groupId,
            proof.merkleTreeDepth,
            proof.merkleTreeRoot,
            proof.nullifier,
            proof.message,
            proof.scope,
            proof.points
        );
    }

    /// @dev See {ISemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        SemaphoreProof calldata proof
    ) public view override onlyExistingGroup(groupId) returns (bool) {
        // The function will revert if the Merkle tree depth is not supported.
        if (proof.merkleTreeDepth < MIN_DEPTH || proof.merkleTreeDepth > MAX_DEPTH) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }

        // Gets the number of leaves in the Incremental Merkle Tree that represents the group
        // with id groupId which is the same as the number of members in the group groupId.
        uint256 merkleTreeSize = getMerkleTreeSize(groupId);

        // The function will revert if there are no members in the group.
        if (merkleTreeSize == 0) {
            revert Semaphore__GroupHasNoMembers();
        }

        // Gets the Merkle root of the Incremental Merkle Tree that represents the group with id groupId.
        uint256 currentMerkleTreeRoot = getMerkleTreeRoot(groupId);

        // A proof could have used an old Merkle tree root.
        // https://github.com/semaphore-protocol/semaphore/issues/98
        if (proof.merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 merkleRootCreationDate = groups[groupId].merkleRootCreationDates[proof.merkleTreeRoot];
            uint256 merkleTreeDuration = groups[groupId].merkleTreeDuration;

            if (merkleRootCreationDate == 0) {
                revert Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > merkleRootCreationDate + merkleTreeDuration) {
                revert Semaphore__MerkleTreeRootIsExpired();
            }
        }

        return
            verifier.verifyProof(
                [proof.points[0], proof.points[1]],
                [[proof.points[2], proof.points[3]], [proof.points[4], proof.points[5]]],
                [proof.points[6], proof.points[7]],
                [proof.merkleTreeRoot, proof.nullifier, _hash(proof.message), _hash(proof.scope)],
                proof.merkleTreeDepth
            );
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}
