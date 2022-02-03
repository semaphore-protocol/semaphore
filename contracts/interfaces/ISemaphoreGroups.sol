//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @title SemaphoreGroups interface.
/// @dev Interface of a SemaphoreGroups contract.
interface ISemaphoreGroups {
  /// @dev Emitted when a new group is created.
  /// @param id: Id of the group.
  /// @param depth: Depth of the tree.
  event GroupAdded(bytes32 indexed id, uint8 depth);

  /// @dev Emitted when a new identity commitment is added.
  /// @param groupId: Group id of the group.
  /// @param identityCommitment: New identity commitment.
  /// @param root: New root hash of the tree.
  event IdentityCommitmentAdded(bytes32 indexed groupId, uint256 identityCommitment, uint256 root);

  /// @dev Emitted when a new identity commitment is deleted.
  /// @param groupId: Group id of the group.
  /// @param identityCommitment: New identity commitment.
  /// @param root: New root hash of the tree.
  event IdentityCommitmentDeleted(bytes32 indexed groupId, uint256 identityCommitment, uint256 root);

  /// @dev Returns the last root hash of a group.
  /// @param _groupId: Id of the group.
  /// @return Root hash of the group.
  function getRoot(bytes32 _groupId) external view returns (uint256);

  /// @dev Returns the depth of the tree of a group.
  /// @param _groupId: Id of the group.
  /// @return Depth of the group tree.
  function getDepth(bytes32 _groupId) external view returns (uint256);

  /// @dev Returns the number of members of a group.
  /// @param _groupId: Id of the group.
  /// @return Size of the group.
  function getSize(bytes32 _groupId) external view returns (uint256);
}
