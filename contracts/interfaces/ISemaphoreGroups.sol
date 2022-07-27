//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title SemaphoreGroups interface.
/// @dev Interface of a SemaphoreGroups contract.
interface ISemaphoreGroups {
    error Semaphore__GroupDoesNotExist();
    error Semaphore__GroupAlreadyExists();
    error Semaphore__GroupIdIsNotLessThanSnarkScalarField();

    /// @dev Emitted when a new group is created.
    /// @param groupId: Id of the group.
    /// @param depth: Depth of the tree.
    /// @param zeroValue: Zero value of the tree.
    event GroupCreated(uint256 indexed groupId, uint8 depth, uint256 zeroValue);

    /// @dev Emitted when a new identity commitment is added.
    /// @param groupId: Group id of the group.
    /// @param identityCommitment: New identity commitment.
    /// @param root: New root hash of the tree.
    event MemberAdded(uint256 indexed groupId, uint256 identityCommitment, uint256 root);

    /// @dev Emitted when a new identity commitment is removed.
    /// @param groupId: Group id of the group.
    /// @param identityCommitment: New identity commitment.
    /// @param root: New root hash of the tree.
    event MemberRemoved(uint256 indexed groupId, uint256 identityCommitment, uint256 root);

    /// @dev Returns the last root hash of a group.
    /// @param groupId: Id of the group.
    /// @return Root hash of the group.
    function getRoot(uint256 groupId) external view returns (uint256);

    /// @dev Returns the depth of the tree of a group.
    /// @param groupId: Id of the group.
    /// @return Depth of the group tree.
    function getDepth(uint256 groupId) external view returns (uint8);

    /// @dev Returns the max edges of the linkable tree of a group.
    /// @param groupId: Id of the group.
    /// @return Maximum # of edges this group supports
    function getMaxEdges(uint256 groupId) external view returns (uint8);


    /// @dev Returns the number of tree leaves of a group.
    /// @param groupId: Id of the group.
    /// @return Number of tree leaves.
    function getNumberOfLeaves(uint256 groupId) external view returns (uint256);
}
