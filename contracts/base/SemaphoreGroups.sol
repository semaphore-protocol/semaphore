//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {SNARK_SCALAR_FIELD} from "./SemaphoreConstants.sol";
import "../interfaces/ISemaphoreGroups.sol";
import "@zk-kit/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title Semaphore groups contract.
/// @dev The following code allows you to create groups, add and remove members.
/// You can use getters to obtain informations about groups (root, depth, number of leaves).
abstract contract SemaphoreGroups is Context, ISemaphoreGroups {
  using IncrementalBinaryTree for IncrementalTreeData;

  /// @dev Gets a group id and returns the group/tree data.
  mapping(uint256 => IncrementalTreeData) internal groups;

  /// @dev Creates a new group by initializing the associated tree.
  /// @param groupId: Id of the group.
  /// @param depth: Depth of the tree.
  /// @param zeroValue: Zero value of the tree.
  function _createGroup(
    uint256 groupId,
    uint8 depth,
    uint256 zeroValue
  ) internal virtual {
    require(groupId < SNARK_SCALAR_FIELD, "SemaphoreGroups: group id must be < SNARK_SCALAR_FIELD");
    require(getDepth(groupId) == 0, "SemaphoreGroups: group already exists");

    groups[groupId].init(depth, zeroValue);

    emit GroupCreated(groupId, depth, zeroValue);
  }

  /// @dev Adds an identity commitment to an existing group.
  /// @param groupId: Id of the group.
  /// @param identityCommitment: New identity commitment.
  function _addMember(uint256 groupId, uint256 identityCommitment) internal virtual {
    require(getDepth(groupId) != 0, "SemaphoreGroups: group does not exist");

    groups[groupId].insert(identityCommitment);

    uint256 root = getRoot(groupId);

    emit MemberAdded(groupId, identityCommitment, root);
  }

  /// @dev Removes an identity commitment from an existing group. A proof of membership is
  /// needed to check if the node to be deleted is part of the tree.
  /// @param groupId: Id of the group.
  /// @param identityCommitment: Existing identity commitment to be deleted.
  /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
  /// @param proofPathIndices: Path of the proof of membership.
  function _removeMember(
    uint256 groupId,
    uint256 identityCommitment,
    uint256[] calldata proofSiblings,
    uint8[] calldata proofPathIndices
  ) internal virtual {
    require(getDepth(groupId) != 0, "SemaphoreGroups: group does not exist");

    groups[groupId].remove(identityCommitment, proofSiblings, proofPathIndices);

    uint256 root = getRoot(groupId);

    emit MemberRemoved(groupId, identityCommitment, root);
  }

  /// @dev See {ISemaphoreGroups-getRoot}.
  function getRoot(uint256 groupId) public view virtual override returns (uint256) {
    return groups[groupId].root;
  }

  /// @dev See {ISemaphoreGroups-getDepth}.
  function getDepth(uint256 groupId) public view virtual override returns (uint8) {
    return groups[groupId].depth;
  }

  /// @dev See {ISemaphoreGroups-getNumberOfLeaves}.
  function getNumberOfLeaves(uint256 groupId) public view virtual override returns (uint256) {
    return groups[groupId].numberOfLeaves;
  }
}
