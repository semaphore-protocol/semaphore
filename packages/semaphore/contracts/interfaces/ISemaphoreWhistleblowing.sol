//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title SemaphoreWhistleblowing interface.
/// @dev Interface of SemaphoreWhistleblowing contract.
interface ISemaphoreWhistleblowing {
    error Semaphore__CallerIsNotTheEditor();
    error Semaphore__MerkleTreeDepthIsNotSupported();

    struct Verifier {
        address contractAddress;
        uint256 merkleTreeDepth;
    }

    /// @dev Emitted when a new entity is created.
    /// @param entityId: Id of the entity.
    /// @param editor: Editor of the entity.
    event EntityCreated(uint256 entityId, address indexed editor);

    /// @dev Emitted when a whistleblower publish a new leak.
    /// @param entityId: Id of the entity.
    /// @param leak: News leak.
    event LeakPublished(uint256 indexed entityId, bytes32 leak);

    struct Entity {
        uint256 id;
        uint8 maxEdges;
    }

    /// @dev Creates an entity and the associated Merkle tree/group.
    /// @param entityId: Id of the entity.
    /// @param merkleTreeDepth: Depth of the tree.
    /// @param editor: Editor of the entity.
    /// @param maxEdges: The maximum # of edges supported by this group
    function createEntity(
        uint256 entityId,
        uint256 merkleTreeDepth,
        address editor,
        uint8 maxEdges
    ) external;

    /// @dev Add an edge to the tree or update an existing edge.
    /// @param entityId The entityId of the LinkableTree
    /// @param root The merkle root of the edge's merkle tree
    /// @param leafIndex The latest leaf insertion index of the edge's merkle tree
    /// @param typedChainId The origin resource ID of the originating linked anchor update
    function updateEdge(
        uint256 entityId,
        uint256 root,
        uint32 leafIndex,
        bytes32 typedChainId
    ) external;

    /// @dev Adds a whistleblower to an entity.
    /// @param entityId: Id of the entity.
    /// @param identityCommitment: Identity commitment of the group member.
    function addWhistleblower(
        uint256 entityId,
        uint256 identityCommitment
    ) external;

    /// @dev Removes a whistleblower from an entity.
    /// @param entityId: Id of the entity.
    /// @param identityCommitment: Identity commitment of the group member.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function removeWhistleblower(
        uint256 entityId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external;

    /// @dev Allows whistleblowers to publish leaks anonymously.
    /// @param leak: News leak.
    /// @param nullifierHash: Nullifier hash.
    /// @param entityId: Id of the entity.
    /// @param proof: Private zk-proof parameters.
    function publishLeak(
        bytes32 leak,
        uint256 nullifierHash,
        uint256 entityId,
        bytes calldata roots,
        uint256[8] calldata proof
    ) external;
}
