//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {SNARK_SCALAR_FIELD} from "./SemaphoreConstants.sol";
import "../interfaces/ISemaphoreGroups.sol";
import "@zk-kit/incremental-merkle-tree.sol/IncrementalBinaryTree.sol";
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
    /// @param merkleTreeDepth: Depth of the tree.
    /// @param zeroValue: Zero value of the tree.
    function _createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint256 zeroValue
    ) internal virtual {
        if (groupId >= SNARK_SCALAR_FIELD) {
            revert Semaphore__GroupIdIsNotLessThanSnarkScalarField();
        }

        if (getMerkleTreeDepth(groupId) != 0) {
            revert Semaphore__GroupAlreadyExists();
        }

        groups[groupId].init(merkleTreeDepth, zeroValue);

        emit GroupCreated(groupId, merkleTreeDepth, zeroValue);
    }

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function _addMember(uint256 groupId, uint256 identityCommitment) internal virtual {
        if (getMerkleTreeDepth(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        groups[groupId].insert(identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        emit MemberAdded(groupId, identityCommitment, merkleTreeRoot);
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
        if (getMerkleTreeRoot(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        groups[groupId].remove(identityCommitment, proofSiblings, proofPathIndices);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        emit MemberRemoved(groupId, identityCommitment, merkleTreeRoot);
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeRoot}.
    function getMerkleTreeRoot(uint256 groupId) public view virtual override returns (uint256) {
        return groups[groupId].root;
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeDepth}.
    function getMerkleTreeDepth(uint256 groupId) public view virtual override returns (uint256) {
        return groups[groupId].depth;
    }

    /// @dev See {ISemaphoreGroups-getNumberOfMerkleTreeLeaves}.
    function getNumberOfMerkleTreeLeaves(uint256 groupId) public view virtual override returns (uint256) {
        return groups[groupId].numberOfLeaves;
    }
}
