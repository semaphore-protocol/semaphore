//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/ISemaphoreGroups.sol";
import {InternalLeanIMT, LeanIMTData} from "@zk-kit/imt.sol/internal/InternalLeanIMT.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title Semaphore groups contract.
/// @dev This contract allows you to create groups, add, remove and update members.
/// You can use getters to obtain informations about groups (root, depth, number of leaves).
abstract contract SemaphoreGroups is Context, ISemaphoreGroups {
    using InternalLeanIMT for LeanIMTData;

    /// @dev Gets a group id and returns the tree data.
    mapping(uint256 => LeanIMTData) internal merkleTrees;

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function _addMember(uint256 groupId, uint256 identityCommitment) internal virtual {
        uint256 merkleTreeRoot = merkleTrees[groupId]._insert(identityCommitment);
        uint256 leafIndex = getMerkleTreeSize(groupId) - 1;

        emit MemberAdded(groupId, leafIndex, identityCommitment, merkleTreeRoot);
    }

    /// @dev Updates an identity commitment of an existing group. A proof of membership is
    /// needed to check if the node to be updated is part of the tree.
    /// @param groupId: Id of the group.
    /// @param oldIdentityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    function _updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) internal virtual {
        uint256 merkleTreeRoot = merkleTrees[groupId]._update(
            oldIdentityCommitment,
            newIdentityCommitment,
            merkleProofSiblings
        );
        uint256 leafIndex = merkleTrees[groupId]._indexOf(newIdentityCommitment);

        emit MemberUpdated(groupId, leafIndex, oldIdentityCommitment, newIdentityCommitment, merkleTreeRoot);
    }

    /// @dev Removes an identity commitment from an existing group. A proof of membership is
    /// needed to check if the node to be deleted is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be removed.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    function _removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) internal virtual {
        uint256 leafIndex = merkleTrees[groupId]._indexOf(identityCommitment);
        uint256 merkleTreeRoot = merkleTrees[groupId]._remove(identityCommitment, merkleProofSiblings);

        emit MemberRemoved(groupId, leafIndex, identityCommitment, merkleTreeRoot);
    }

    /// @dev See {ISemaphoreGroups-hasMember}.
    function hasMember(uint256 groupId, uint256 identityCommitment) public view virtual override returns (bool) {
        return merkleTrees[groupId]._has(identityCommitment);
    }

    /// @dev See {ISemaphoreGroups-indexOf}.
    function indexOf(uint256 groupId, uint256 identityCommitment) public view virtual override returns (uint256) {
        return merkleTrees[groupId]._indexOf(identityCommitment);
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeRoot}.
    function getMerkleTreeRoot(uint256 groupId) public view virtual override returns (uint256) {
        return merkleTrees[groupId]._root();
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeDepth}.
    function getMerkleTreeDepth(uint256 groupId) public view virtual override returns (uint256) {
        return merkleTrees[groupId].depth;
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeSize}.
    function getMerkleTreeSize(uint256 groupId) public view virtual override returns (uint256) {
        return merkleTrees[groupId].size;
    }
}
