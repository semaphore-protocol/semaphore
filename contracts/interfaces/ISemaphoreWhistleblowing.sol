//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title SemaphoreWhistleblowing interface.
/// @dev Interface of SemaphoreWhistleblowing contract.
interface ISemaphoreWhistleblowing {
    /// @dev Emitted when a new entity is created.
    /// @param entityId: Id of the entity.
    /// @param editor: Editor of the entity.
    event EntityCreated(uint256 entityId, address indexed editor);

    /// @dev Emitted when a whistleblower publish a new leak.
    /// @param entityId: Id of the entity.
    /// @param leak: News leak.
    event LeakPublished(uint256 indexed entityId, bytes32 leak);

    /// @dev Creates an entity and the associated Merkle tree/group.
    /// @param entityId: Id of the entity.
    /// @param editor: Editor of the entity.
    /// @param depth: Depth of the tree.
    function createEntity(
        uint256 entityId,
        address editor,
        uint8 depth,
        uint8 maxEdges
    ) external;

    /// @dev Adds a whistleblower to an entity.
    /// @param entityId: Id of the entity.
    /// @param identityCommitment: Identity commitment of the group member.
    function addWhistleblower(uint256 entityId, uint256 identityCommitment) external;

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
