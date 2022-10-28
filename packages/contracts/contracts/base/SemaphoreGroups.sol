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
    mapping(uint256 => LinkableIncrementalTreeData) internal merkleTree;

    /// @dev Creates a new group by initializing the associated tree.
    /// @param groupId: Id of the group.
    /// @param merkleTreeDepth: Depth of the tree.
    /// @param maxEdges: The maximum # of edges supported by this group
    function _createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint8 maxEdges
    ) internal virtual {
        if (groupId >= SNARK_SCALAR_FIELD) {
            revert Semaphore__GroupIdIsNotLessThanSnarkScalarField();
        }

        if (getMerkleTreeDepth(groupId) != 0) {
            revert Semaphore__GroupAlreadyExists();
        }

        merkleTree[groupId].init(merkleTreeDepth, maxEdges);
        uint root = merkleTree[groupId].getLastRoot();

        emit GroupCreated(groupId, merkleTreeDepth, root);
    }

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function _addMember(uint256 groupId, uint256 identityCommitment)
        internal
        virtual
    {
        if (getMerkleTreeDepth(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        merkleTree[groupId].insert(identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);
        uint256 index = getNumberOfMerkleTreeLeaves(groupId) - 1;

        emit MemberAdded(groupId, index, identityCommitment, merkleTreeRoot);
    }

    /// @dev Updates an identity commitment of an existing group. A proof of membership is
    /// needed to check if the node to be updated is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function _updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) internal virtual {
        if (getMerkleTreeRoot(groupId) == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        merkleTree[groupId].update(
            identityCommitment,
            newIdentityCommitment,
            proofSiblings,
            proofPathIndices
        );

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);
        uint256 index = proofPathIndicesToMemberIndex(proofPathIndices);

        emit MemberUpdated(
            groupId,
            index,
            identityCommitment,
            newIdentityCommitment,
            merkleTreeRoot
        );
    }

    /// @dev Removes an identity commitment from an existing group. A proof of membership is
    /// needed to check if the node to be deleted is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be removed.
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

        merkleTree[groupId].remove(
            identityCommitment,
            proofSiblings,
            proofPathIndices
        );

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);
        uint256 index = proofPathIndicesToMemberIndex(proofPathIndices);

        emit MemberRemoved(groupId, index, identityCommitment, merkleTreeRoot);
    }

    /**
        @notice Add an edge to the tree or update an existing edge.
        @param _root The merkle root of the edge's merkle tree
        @param _leafIndex The latest leaf insertion index of the edge's merkle tree
        @param _srcResourceID The chainID of the edge's LinkableTree
     */
    function _updateEdge(
        uint256 _groupId,
        uint256 _root,
        uint32 _leafIndex,
        bytes32 _srcResourceID
    ) internal {
        merkleTree[_groupId].updateEdge(_root, _leafIndex, _srcResourceID);
    }

    // TODO: Generalize this over maxEdges
    // // Function exposed for testing purposes
    function verifyRoots(uint256 groupId, bytes calldata roots)
        public
        view
        override
        returns (bool)
    {
        if (merkleTree[groupId].maxEdges == 1) {
            uint256[2] memory rootsDecoded = abi.decode(roots, (uint256[2]));

            uint256[] memory rootsEncoded = new uint256[](rootsDecoded.length);
            for (uint256 i = 0; i < rootsDecoded.length; i++) {
                rootsEncoded[i] = rootsDecoded[i];
            }
            bool validRoots = LinkableIncrementalBinaryTree.isValidRoots(
                merkleTree[groupId],
                rootsEncoded
            );
            return validRoots;
        } else {
            uint256[8] memory rootsDecoded = abi.decode(roots, (uint256[8]));

            uint256[] memory rootsEncoded = new uint256[](rootsDecoded.length);
            for (uint256 i = 0; i < rootsDecoded.length; i++) {
                rootsEncoded[i] = rootsDecoded[i];
            }
            bool validRoots = LinkableIncrementalBinaryTree.isValidRoots(
                merkleTree[groupId],
                rootsEncoded
            );
            return validRoots;
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
        return merkleTree[groupId].getLatestNeighborEdges();
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeRoot}.
    function getMerkleTreeRoot(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return merkleTree[groupId].getLastRoot();
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeDepth}.
    function getMerkleTreeDepth(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return merkleTree[groupId].depth;
    }

    /// @dev See {ISemaphoreGroups-getMaxEdges}.
    function getMaxEdges(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint8)
    {
        return merkleTree[groupId].maxEdges;
    }

    /// @dev See {ISemaphoreGroups-getNumberOfMerkleTreeLeaves}.
    function getNumberOfMerkleTreeLeaves(uint256 groupId)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return merkleTree[groupId].numberOfLeaves;
    }

    /// @dev Converts the path indices of a Merkle proof to the identity commitment index in the tree.
    /// @param proofPathIndices: Path of the proof of membership.
    /// @return Index of a group member.
    function proofPathIndicesToMemberIndex(uint8[] calldata proofPathIndices)
        private
        pure
        returns (uint256)
    {
        uint256 memberIndex = 0;

        for (uint8 i = uint8(proofPathIndices.length); i > 0; ) {
            if (memberIndex > 0 || proofPathIndices[i - 1] != 0) {
                memberIndex *= 2;

                if (proofPathIndices[i - 1] == 1) {
                    memberIndex += 1;
                }
            }

            unchecked {
                --i;
            }
        }

        return memberIndex;
    }
}
