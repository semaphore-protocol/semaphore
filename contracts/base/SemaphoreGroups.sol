//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {SNARK_SCALAR_FIELD} from "./SemaphoreConstants.sol";
import "../interfaces/ISemaphoreGroups.sol";
import "./LinkableIncrementalBinaryTree.sol";
import {Edge} from "./LinkableIncrementalBinaryTree.sol";
import "@openzeppelin/contracts/utils/Context.sol";

// import "hardhat/console.sol";

/// @title Semaphore groups contract.
/// @dev The following code allows you to create groups, add and remove members.
/// You can use getters to obtain informations about groups (root, depth, number of leaves).
abstract contract SemaphoreGroups is Context, ISemaphoreGroups {
    using LinkableIncrementalBinaryTree for LinkableIncrementalTreeData;

    /// @dev Gets a group id and returns the group/tree data.
    mapping(uint256 => LinkableIncrementalTreeData) internal groups;

    /// @dev Creates a new group by initializing the associated tree.
    /// @param groupId: Id of the group.
    /// @param depth: Depth of the tree.
    /// @param maxEdges: The maximum # of edges supported by this group
    function _createGroup(uint256 groupId, uint8 depth, uint8 maxEdges)
        internal
        virtual
    {
        if (groupId >= SNARK_SCALAR_FIELD) {
            revert Semaphore__GroupIdIsNotLessThanSnarkScalarField();
        }

        if (getDepth(groupId) != 0) {
            revert Semaphore__GroupAlreadyExists();
        }

        groups[groupId].init(depth, maxEdges);

        emit GroupCreated(groupId, depth);
    }

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function _addMember(uint256 groupId, uint256 identityCommitment)
        internal
        virtual
    {
        if (getDepth(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

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
        if (getDepth(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        groups[groupId].remove(
            identityCommitment,
            proofSiblings,
            proofPathIndices
        );

        uint256 root = getRoot(groupId);

        emit MemberRemoved(groupId, identityCommitment, root);
    }

    /**
        @notice Add an edge to the tree or update an existing edge.
        @param _root The merkle root of the edge's merkle tree
        @param _leafIndex The latest leaf insertion index of the edge's merkle tree
        @param _srcResourceID The chainID of the edge's LinkableTree
     */
    function _updateEdge(
        uint256 _groupId,
        bytes32 _root,
        uint32 _leafIndex,
        bytes32 _srcResourceID
    ) internal {
        groups[_groupId].updateEdge(_root, _leafIndex, _srcResourceID);
    }

    // TODO: Generalize this over maxEdges
    // // Function exposed for testing purposes
    function verifyRoots(uint256 groupId, bytes calldata roots)
        public
        view
        override
        returns (bool)
    {
        if(groups[groupId].maxEdges == 1) {
            bytes32[2] memory roots_decoded = abi.decode(roots, (bytes32[2]));

            bytes32[] memory roots_encoded = new bytes32[](roots_decoded.length);
            for (uint256 i = 0; i < roots_decoded.length; i++) {
                roots_encoded[i] = roots_decoded[i];
            }
            bool valid_roots = LinkableIncrementalBinaryTree.isValidRoots(
                groups[groupId],
                roots_encoded
            );
            return valid_roots;
        } else {
            bytes32[8] memory roots_decoded = abi.decode(roots, (bytes32[8]));

            bytes32[] memory roots_encoded = new bytes32[](roots_decoded.length);
            for (uint256 i = 0; i < roots_decoded.length; i++) {
                roots_encoded[i] = roots_decoded[i];
            }
            bool valid_roots = LinkableIncrementalBinaryTree.isValidRoots(
                groups[groupId],
                roots_encoded
            );
            return valid_roots;
        }

    }

    /// @dev See {ISemaphoreGroups-getLatestNeighborEdges}.
    function getLatestNeighborEdges(uint256 groupId)
        public
        view
        virtual
        override
        returns (Edge[] memory)
    {
        return groups[groupId].getLatestNeighborEdges();
    }

    /// @dev See {ISemaphoreGroups-getRoot}.
    function getRoot(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return uint256(groups[groupId].getLastRoot());
    }

    /// @dev See {ISemaphoreGroups-getDepth}.
    function getDepth(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint8)
    {
        return groups[groupId].depth;
    }

    /// @dev See {ISemaphoreGroups-getMaxEdges}.
    function getMaxEdges(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint8)
    {
        return groups[groupId].maxEdges;
    }

    /// @dev See {ISemaphoreGroups-getNumberOfLeaves}.
    function getNumberOfLeaves(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return groups[groupId].numberOfLeaves;
    }
}
