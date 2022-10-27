//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import {Edge} from "../base/LinkableIncrementalBinaryTree.sol";

/// @title SemaphoreGroups interface.
/// @dev Interface of a SemaphoreGroups contract.
interface ISemaphoreGroups {
    error Semaphore__GroupDoesNotExist();
    error Semaphore__GroupAlreadyExists();
    error Semaphore__GroupIdIsNotLessThanSnarkScalarField();
    error Semaphore__InvalidCurrentChainRoot();
    error Semaphore__InvalidEdgeChainRoot();

    /// @dev Emitted when a new group is created.
    /// @param groupId: Id of the group.
    /// @param merkleTreeDepth: Depth of the tree.
    event GroupCreated(uint256 indexed groupId, uint256 merkleTreeDepth, uint256 merkleTreeRoot);

    /// @dev Emitted when a new identity commitment is added.
    /// @param groupId: Group id of the group.
    /// @param index: Identity commitment index.
    /// @param identityCommitment: New identity commitment.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot);

    /// @dev Emitted when an identity commitment is updated.
    /// @param groupId: Group id of the group.
    /// @param index: Identity commitment index.
    /// @param identityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberUpdated(
        uint256 indexed groupId,
        uint256 index,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256 merkleTreeRoot
    );

    /// @dev Emitted when a new identity commitment is removed.
    /// @param groupId: Group id of the group.
    /// @param index: Identity commitment index.
    /// @param identityCommitment: Existing identity commitment to be removed.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberRemoved(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot);


    function verifyRoots(uint256 groupId, bytes calldata roots)
        external
        view
        returns (bool);

    // function _updateEdge(
    //     uint256 groupId,
    //     uint256 sourceChainID,
    //     bytes32 root,
    //     uint256 leafIndex,
    //     bytes32 target
    // ) external;

    /// @dev Returns the last root hash of a group.
    /// @param groupId: Id of the group.
    /// @return Latests roots from each edge connected
    function getLatestNeighborEdges(uint256 groupId)
        external
        view
        returns (Edge[] memory);

    /// @dev Returns the last root hash of a group.
    /// @param groupId: Id of the group.
    /// @return Root hash of the group.
    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256);

    /// @dev Returns the depth of the tree of a group.
    /// @param groupId: Id of the group.
    /// @return Depth of the group tree.
    function getMerkleTreeDepth(uint256 groupId) external view returns (uint256);

    /// @dev Returns the max edges of the linkable tree of a group.
    /// @param groupId: Id of the group.
    /// @return Maximum # of edges this group supports
    function getMaxEdges(uint256 groupId) external view returns (uint8);

    /// @dev Returns the number of tree leaves of a group.
    /// @param groupId: Id of the group.
    /// @return Number of tree leaves.
    function getNumberOfMerkleTreeLeaves(uint256 groupId) external view returns (uint256);
}
