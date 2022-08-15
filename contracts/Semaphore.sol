// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/ISemaphore.sol";
import "./verifiers/SemaphoreVerifier.sol";
import "./base/SemaphoreCore.sol";
import "./base/SemaphoreGroups.sol";
import {PoseidonT3} from "@zk-kit/incremental-merkle-tree.sol/Hashes.sol";

/// @title Semaphore
contract Semaphore is ISemaphore, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint8 => SemaphoreVerifier) public verifiers;

    /// @dev Gets a group id and returns the group admin address.
    mapping(uint256 => address) public groupAdmins;

    /// @dev Gets a group id and returns the max edges for this group
    mapping(uint256 => uint8) public groupMaxEdges;

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        if (groupAdmins[groupId] != _msgSender()) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
        _;
    }

    /// @dev Checks if there is a verifier for the given tree depth.
    /// @param depth: Depth of the tree.
    modifier onlySupportedDepth(uint8 depth) {
        if (address(verifiers[depth]) == address(0)) {
            revert Semaphore__TreeDepthIsNotSupported();
        }
        _;
    }

    /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
    /// @param _verifiers: List of Semaphore verifiers (address and related Merkle tree depth).
    constructor(Verifier[] memory _verifiers) {
        for (uint8 i = 0; i < _verifiers.length; i++) {
            verifiers[_verifiers[i].merkleTreeDepth] = SemaphoreVerifier(_verifiers[i].contractAddress);
        }
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint8 depth,
        uint256 zeroValue,
        address admin,
        uint8 maxEdges
    ) external override onlySupportedDepth(depth) {
        _createGroup(groupId, depth, zeroValue, maxEdges);
        groupMaxEdges[groupId] = maxEdges;
        groupAdmins[groupId] = admin;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-updateGroupAdmin}.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override onlyGroupAdmin(groupId) {
        groupAdmins[groupId] = newAdmin;

        emit GroupAdminUpdated(groupId, _msgSender(), newAdmin);
    }

    /**
		@notice Add an edge to the tree or update an existing edge.
		@param groupId The groupID of the LinkableTree
		@param sourceChainID The chainID of the edge's LinkableTree
		@param root The merkle root of the edge's merkle tree
		@param leafIndex The latest leaf insertion index of the edge's merkle tree
	 */
    function updateEdge(
        uint256 groupId,
        uint256 sourceChainID,
        bytes32 root,
        uint256 leafIndex,
        bytes32 target
    ) external override onlyGroupAdmin(groupId) {
        _updateEdge(groupId, sourceChainID, root, leafIndex, target);
    }
    /// @dev See {ISemaphore-addMember}.
    function addMember(uint256 groupId, uint256 identityCommitment) external override onlyGroupAdmin(groupId) {
        _addMember(groupId, identityCommitment);
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
        bytes32 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        // TODO: Create standard encoding for which order each root is supposed to be at.
        bytes calldata roots,
        uint256[8] calldata proof
    ) external override {
        // TODO: check here if roots match?
        uint256 root = getRoot(groupId);
        uint8 depth = getDepth(groupId);
        uint8 maxEdges = getMaxEdges(groupId);
        bytes32[] memory roots_decoded;

        if (depth == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        roots_decoded = abi.decode(roots, (bytes32[]));
         // TODO: add all if conditions correctly
        // if (maxEdges == 1) {
        //      roots = abi.decode(roots_bytes, (bytes32[2]));
        // } 

        _verifyRoots(groupId, roots_decoded);

        SemaphoreVerifier verifier = verifiers[depth];

        _verifyProof(signal, nullifierHash, externalNullifier, roots, proof, verifier, maxEdges, root);

        _saveNullifierHash(nullifierHash);

        emit ProofVerified(groupId, signal);
    }
}
