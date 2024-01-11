//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/// @title SemaphoreGroups contract interface.
interface ISemaphoreGroups {
    error Semaphore__GroupDoesNotExist();
    error Semaphore__GroupAlreadyExists();
    error Semaphore__CallerIsNotTheGroupAdmin();

    /// @dev Emitted when a new group is created.
    /// @param groupId: Id of the group.
    event GroupCreated(uint256 indexed groupId);

    /// @dev Emitted when an admin is assigned to a group.
    /// @param groupId: Id of the group.
    /// @param oldAdmin: Old admin of the group.
    /// @param newAdmin: New admin of the group.
    event GroupAdminUpdated(uint256 indexed groupId, address indexed oldAdmin, address indexed newAdmin);

    /// @dev Emitted when a new identity commitment is added.
    /// @param groupId: Group id of the group.
    /// @param leafIndex: Merkle tree leaf index.
    /// @param identityCommitment: New identity commitment.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberAdded(uint256 indexed groupId, uint256 leafIndex, uint256 identityCommitment, uint256 merkleTreeRoot);

    /// @dev Emitted when an identity commitment is updated.
    /// @param groupId: Group id of the group.
    /// @param leafIndex: Identity commitment index.
    /// @param identityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberUpdated(
        uint256 indexed groupId,
        uint256 leafIndex,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256 merkleTreeRoot
    );

    /// @dev Emitted when a new identity commitment is removed.
    /// @param groupId: Group id of the group.
    /// @param leafIndex: Identity commitment index.
    /// @param identityCommitment: Existing identity commitment to be removed.
    /// @param merkleTreeRoot: New root hash of the tree.
    event MemberRemoved(uint256 indexed groupId, uint256 leafIndex, uint256 identityCommitment, uint256 merkleTreeRoot);

    /// @dev Returns true if a member exists in a group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment.
    /// @return True if the member exists, false otherwise.
    function hasMember(uint256 groupId, uint256 identityCommitment) external view returns (bool);

    /// @dev Returns the index of a member.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment.
    /// @return Index of member.
    function indexOf(uint256 groupId, uint256 identityCommitment) external view returns (uint256);

    /// @dev Returns the last root hash of a group.
    /// @param groupId: Id of the group.
    /// @return Root hash of the group.
    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256);

    /// @dev Returns the depth of the tree of a group.
    /// @param groupId: Id of the group.
    /// @return Depth of the group tree.
    function getMerkleTreeDepth(uint256 groupId) external view returns (uint256);

    /// @dev Returns the number of tree leaves of a group.
    /// @param groupId: Id of the group.
    /// @return Number of tree leaves.
    function getMerkleTreeSize(uint256 groupId) external view returns (uint256);
}
