// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./interfaces/ISemaphore.sol";
import "./interfaces/IVerifier.sol";
import "./base/SemaphoreCore.sol";
import "./base/SemaphoreGroups.sol";

/// @title Semaphore
contract Semaphore is ISemaphore, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint256 => IVerifier) public verifiers;

    /// @dev Gets a group id and returns the group admin address.
    mapping(uint256 => address) public groupAdmins;

    /// @dev Gets a group id and returns data to check if a Merkle root is expired.
    mapping(uint256 => MerkleTreeExpiry) public merkleTreeExpiries;

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        if (groupAdmins[groupId] != _msgSender()) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
        _;
    }

    /// @dev Checks if there is a verifier for the given tree depth.
    /// @param merkleTreeDepth: Depth of the tree.
    modifier onlySupportedMerkleTreeDepth(uint256 merkleTreeDepth) {
        if (address(verifiers[merkleTreeDepth]) == address(0)) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }
        _;
    }

    /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
    /// @param _verifiers: List of Semaphore verifiers (address and related Merkle tree depth).
    constructor(Verifier[] memory _verifiers) {
        for (uint8 i = 0; i < _verifiers.length; ) {
            verifiers[_verifiers[i].merkleTreeDepth] = IVerifier(_verifiers[i].contractAddress);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint256 zeroValue,
        address admin
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth, zeroValue);

        groupAdmins[groupId] = admin;
        merkleTreeExpiries[groupId].rootDuration = 1 hours;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint256 zeroValue,
        address admin,
        uint256 merkleTreeRootDuration
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth, zeroValue);

        groupAdmins[groupId] = admin;
        merkleTreeExpiries[groupId].rootDuration = merkleTreeRootDuration;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-updateGroupAdmin}.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override onlyGroupAdmin(groupId) {
        groupAdmins[groupId] = newAdmin;

        emit GroupAdminUpdated(groupId, _msgSender(), newAdmin);
    }

    /// @dev See {ISemaphore-addMember}.
    function addMember(uint256 groupId, uint256 identityCommitment) external override onlyGroupAdmin(groupId) {
        _addMember(groupId, identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        merkleTreeExpiries[groupId].rootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-addMembers}.
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments)
        external
        override
        onlyGroupAdmin(groupId)
    {
        for (uint8 i = 0; i < identityCommitments.length; ) {
            _addMember(groupId, identityCommitments[i]);

            unchecked {
                ++i;
            }
        }

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        merkleTreeExpiries[groupId].rootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-updateMember}.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _updateMember(groupId, identityCommitment, newIdentityCommitment, proofSiblings, proofPathIndices);
    }

    /// @dev See {ISemaphore-removeMember}.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _removeMember(groupId, identityCommitment, proofSiblings, proofPathIndices);
    }

    /// @dev See {ISemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        bytes32 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external override {
        uint256 currentMerkleTreeRoot = getMerkleTreeRoot(groupId);

        if (currentMerkleTreeRoot == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        if (merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 rootCreationDate = merkleTreeExpiries[groupId].rootCreationDates[merkleTreeRoot];
            uint256 rootDuration = merkleTreeExpiries[groupId].rootDuration;

            if (rootCreationDate == 0) {
                revert Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > rootCreationDate + rootDuration) {
                revert Semaphore__MerkleTreeRootIsExpired();
            }
        }

        uint256 merkleTreeDepth = getMerkleTreeDepth(groupId);

        IVerifier verifier = verifiers[merkleTreeDepth];

        _verifyProof(signal, merkleTreeRoot, nullifierHash, externalNullifier, proof, verifier);

        _saveNullifierHash(uint256(keccak256(abi.encodePacked(groupId, nullifierHash))));

        emit ProofVerified(groupId, merkleTreeRoot, nullifierHash, externalNullifier, signal);
    }
}
