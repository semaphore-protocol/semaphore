//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {SNARK_SCALAR_FIELD} from "./SemaphoreConstants.sol";
import "./interfaces/ISemaphoreGroups.sol";
import "@zk-kit/incremental-merkle-tree.sol/contracts/IncrementalQuinTree.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title Semaphore groups contract.
/// @dev The following code allows you to create groups, add and remove members.
/// You can use getters to obtain informations about groups, whereas the `rootHistory`
/// mapping can be used to check if a Semaphore proof root exists onchain.
abstract contract SemaphoreGroups is Context, ISemaphoreGroups {
  using IncrementalQuinTree for IncrementalTreeData;

  /// @dev Gets a group id and returns the group/tree data.
  mapping(uint256 => IncrementalTreeData) internal groups;

  /// @dev Gets a root hash and returns the group id.
  /// It can be used to check if the root a Semaphore proof exists.
  mapping(uint256 => uint256) internal rootHistory;

  /// @dev Creates a new group by initializing the associated tree.
  /// @param groupId: Id of the group.
  /// @param depth: Depth of the tree.
  /// @param zeroValue: Zero value of the tree.
  function _createGroup(
    uint256 groupId,
    uint8 depth,
    uint256 zeroValue
  ) internal virtual {
    require(getDepth(groupId) == 0, "SemaphoreGroups: group already exists");
    require(zeroValue < SNARK_SCALAR_FIELD, "SemaphoreGroups: zero value must be < SNARK_SCALAR_FIELD");

    groups[groupId].init(depth, zeroValue);

    emit GroupAdded(groupId, depth);
  }

  /// @dev Adds an identity commitment to an existing group.
  /// @param groupId: Id of the group.
  /// @param identityCommitment: New identity commitment.
  function _addIdentityCommitment(uint256 groupId, uint256 identityCommitment) internal virtual {
    require(getDepth(groupId) != 0, "SemaphoreGroups: group does not exist");
    require(
      identityCommitment < SNARK_SCALAR_FIELD,
      "SemaphoreGroups: identity commitment must be < SNARK_SCALAR_FIELD"
    );

    groups[groupId].insert(identityCommitment);

    uint256 root = getRoot(groupId);
    rootHistory[root] = groupId;

    emit IdentityCommitmentAdded(groupId, identityCommitment, root);
  }

  /// @dev Deletes an identity commitment from an existing group. A proof of membership is
  /// needed to check if the node to be deleted is part of the tree.
  /// @param groupId: Id of the group.
  /// @param identityCommitment: Existing identity commitment to be deleted.
  /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
  /// @param proofPathIndices: Path of the proof of membership.
  function _deleteIdentityCommitment(
    uint256 groupId,
    uint256 identityCommitment,
    uint256[4][] calldata proofSiblings,
    uint8[] calldata proofPathIndices
  ) internal virtual {
    require(getDepth(groupId) != 0, "SemaphoreGroups: group does not exist");
    require(
      identityCommitment < SNARK_SCALAR_FIELD,
      "SemaphoreGroups: identity commitment must be < SNARK_SCALAR_FIELD"
    );

    groups[groupId].remove(identityCommitment, proofSiblings, proofPathIndices);

    uint256 root = getRoot(groupId);
    rootHistory[root] = groupId;

    emit IdentityCommitmentDeleted(groupId, identityCommitment, groups[groupId].root);
  }

  /// @dev See {ISemaphoreGroups-getRoot}.
  function getRoot(uint256 groupId) public view override returns (uint256) {
    return groups[groupId].root;
  }

  /// @dev See {ISemaphoreGroups-getDepth}.
  function getDepth(uint256 groupId) public view override returns (uint256) {
    return groups[groupId].depth;
  }

  /// @dev See {ISemaphoreGroups-getSize}.
  function getSize(uint256 groupId) public view override returns (uint256) {
    return groups[groupId].numberOfLeaves;
  }
}
