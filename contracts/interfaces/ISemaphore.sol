//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Semaphore interface.
/// @dev Interface of a Semaphore contract.
interface ISemaphore {
    error Semaphore__CallerIsNotTheGroupAdmin();
    error Semaphore__TreeDepthIsNotSupported();

    struct Verifier {
        address contractAddress;
        uint8 merkleTreeDepth;
    }

    /// @dev Emitted when an admin is assigned to a group.
    /// @param groupId: Id of the group.
    /// @param oldAdmin: Old admin of the group.
    /// @param newAdmin: New admin of the group.
    event GroupAdminUpdated(uint256 indexed groupId, address indexed oldAdmin, address indexed newAdmin);

    /// @dev Emitted when a Semaphore proof is verified.
    /// @param groupId: Id of the group.
    /// @param signal: Semaphore signal.
    event ProofVerified(uint256 indexed groupId, bytes32 signal);

    /// @dev Saves the nullifier hash to avoid double signaling and emits an event
    /// if the zero-knowledge proof is valid.
    /// @param groupId: Id of the group.
    /// @param signal: Semaphore signal.
    /// @param nullifierHash: Nullifier hash.
    /// @param externalNullifier: External nullifier.
    /// @param roots: The roots being proven against
    /// @param proof: Zero-knowledge proof.
    function verifyProof(
        uint256 groupId,
        bytes32 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        bytes calldata roots,
        uint256[8] calldata proof
    ) external;

    function decodeRoots(
        bytes calldata roots
    ) external view returns (bytes32[] memory roots_decoded);

    /// @dev Creates a new group. Only the admin will be able to add or remove members.
    /// @param groupId: Id of the group.
    /// @param depth: Depth of the tree.
    /// @param zeroValue: Zero value of the tree.
    /// @param admin: Admin of the group.
    /// @param maxEdges: The maximum # of edges supported by this group
    function createGroup(
        uint256 groupId,
        uint8 depth,
        uint256 zeroValue,
        address admin,
        uint8 maxEdges
    ) external;

    /// @dev Updates the group admin.
    /// @param groupId: Id of the group.
    /// @param newAdmin: New admin of the group.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external;

    /// @dev Adds a new member to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function addMember(uint256 groupId, uint256 identityCommitment) external;

    /// @dev Removes a member from an existing group. A proof of membership is
    /// needed to check if the node to be removed is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment to be deleted.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external;

    /**
        @notice Add an edge to the tree or update an existing edge.
        @param groupId The groupID of the LinkableTree
        @param root The merkle root of the edge's merkle tree
        @param leafIndex The latest leaf insertion index of the edge's merkle tree
        @param srcResourceID The origin resource ID of the originating linked anchor update
     */
    function updateEdge(
        uint256 groupId,
        bytes32 root,
        uint32 leafIndex,
        bytes32 srcResourceID
    ) external;
}
