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
  /// @param _id: Id of the group.
  /// @param _depth: Depth of the tree.
  function _createGroup(
    uint256 _id,
    uint8 _depth,
    uint256 _zeroValue
  ) internal virtual {
    require(getDepth(_id) == 0, "SemaphoreGroups: group already exists");
    require(_zeroValue < SNARK_SCALAR_FIELD, "SemaphoreGroups: zero value must be < SNARK_SCALAR_FIELD");

    groups[_id].init(_depth, _zeroValue % SNARK_SCALAR_FIELD);

    emit GroupAdded(_id, _depth);
  }

  /// @dev Adds an identity commitment to an existing group.
  /// @param _groupId: Id of the group.
  /// @param _identityCommitment: New identity commitment.
  function _addIdentityCommitment(uint256 _groupId, uint256 _identityCommitment) internal virtual {
    require(getDepth(_groupId) != 0, "SemaphoreGroups: group does not exist");
    require(
      _identityCommitment < SNARK_SCALAR_FIELD,
      "SemaphoreGroups: identity commitment must be < SNARK_SCALAR_FIELD"
    );

    groups[_groupId].insert(_identityCommitment);

    uint256 root = getRoot(_groupId);
    rootHistory[root] = _groupId;

    emit IdentityCommitmentAdded(_groupId, _identityCommitment, root);
  }

  /// @dev Deletes an identity commitment from an existing group. A proof of membership is
  /// needed to check if the node to be deleted is part of the tree.
  /// @param _groupId: Id of the group.
  /// @param _identityCommitment: Existing identity commitment to be deleted.
  /// @param _proofSiblings: Array of the sibling nodes of the proof of membership.
  /// @param _proofPathIndices: Path of the proof of membership.
  function _deleteIdentityCommitment(
    uint256 _groupId,
    uint256 _identityCommitment,
    uint256[4][] calldata _proofSiblings,
    uint8[] calldata _proofPathIndices
  ) internal virtual {
    require(getDepth(_groupId) != 0, "SemaphoreGroups: group does not exist");
    require(
      _identityCommitment < SNARK_SCALAR_FIELD,
      "SemaphoreGroups: identity commitment must be < SNARK_SCALAR_FIELD"
    );

    groups[_groupId].remove(_identityCommitment, _proofSiblings, _proofPathIndices);

    uint256 root = getRoot(_groupId);
    rootHistory[root] = _groupId;

    emit IdentityCommitmentDeleted(_groupId, _identityCommitment, groups[_groupId].root);
  }

  /// @dev See {ISemaphoreGroups-getRoot}.
  function getRoot(uint256 _groupId) public view override returns (uint256) {
    return groups[_groupId].root;
  }

  /// @dev See {ISemaphoreGroups-getDepth}.
  function getDepth(uint256 _groupId) public view override returns (uint256) {
    return groups[_groupId].depth;
  }

  /// @dev See {ISemaphoreGroups-getSize}.
  function getSize(uint256 _groupId) public view override returns (uint256) {
    return groups[_groupId].numberOfLeaves;
  }
}
