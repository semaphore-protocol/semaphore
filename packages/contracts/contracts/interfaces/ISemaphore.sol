//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @title Semaphore interface.
/// @dev Interface of a Semaphore contract.
interface ISemaphore {
    error Semaphore__CallerIsNotTheGroupAdmin();
    error Semaphore__MerkleTreeDepthIsNotSupported();
    error Semaphore__MerkleTreeRootIsExpired();
    error Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
    error Semaphore__YouAreUsingTheSameNillifierTwice();

    struct Verifier {
        address contractAddress;
        uint256 merkleTreeDepth;
    }

    /// It defines all the group parameters, in addition to those in the Merkle tree.
    struct Group {
        address admin;
        uint256 merkleRootDuration;
        mapping(uint256 => uint256) merkleRootCreationDates;
        mapping(uint256 => bool) nullifierHashes;
    }

    /// @dev Emitted when an admin is assigned to a group.
    /// @param groupId: Id of the group.
    /// @param oldAdmin: Old admin of the group.
    /// @param newAdmin: New admin of the group.
    event GroupAdminUpdated(uint256 indexed groupId, address indexed oldAdmin, address indexed newAdmin);

    /// @dev Emitted when a Semaphore proof is verified.
    /// @param groupId: Id of the group.
    /// @param merkleTreeRoot: Root of the Merkle tree.
    /// @param externalNullifier: External nullifier.
    /// @param nullifierHash: Nullifier hash.
    /// @param signal: Semaphore signal.
    event ProofVerified(
        uint256 indexed groupId,
        uint256 merkleTreeRoot,
        uint256 externalNullifier,
        uint256 nullifierHash,
        bytes32 signal
    );

    /// @dev Saves the nullifier hash to avoid double signaling and emits an event
    /// if the zero-knowledge proof is valid.
    /// @param groupId: Id of the group.
    /// @param merkleTreeRoot: Root of the Merkle tree.
    /// @param signal: Semaphore signal.
    /// @param nullifierHash: Nullifier hash.
    /// @param externalNullifier: External nullifier.
    /// @param proof: Zero-knowledge proof.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        bytes32 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external;

    /// @dev Creates a new group. Only the admin will be able to add or remove members.
    /// @param groupId: Id of the group.
    /// @param depth: Depth of the tree.
    /// @param zeroValue: Zero value of the tree.
    /// @param admin: Admin of the group.
    function createGroup(
        uint256 groupId,
        uint256 depth,
        uint256 zeroValue,
        address admin
    ) external;

    /// @dev Creates a new group. Only the admin will be able to add or remove members.
    /// @param groupId: Id of the group.
    /// @param depth: Depth of the tree.
    /// @param zeroValue: Zero value of the tree.
    /// @param admin: Admin of the group.
    /// @param merkleTreeRootDuration: Time before the validity of a root expires.
    function createGroup(
        uint256 groupId,
        uint256 depth,
        uint256 zeroValue,
        address admin,
        uint256 merkleTreeRootDuration
    ) external;

    /// @dev Updates the group admin.
    /// @param groupId: Id of the group.
    /// @param newAdmin: New admin of the group.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external;

    /// @dev Adds a new member to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    function addMember(uint256 groupId, uint256 identityCommitment) external;

    /// @dev Adds new members to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitments: New identity commitments.
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external;

    /// @dev Updates an identity commitment of an existing group. A proof of membership is
    /// needed to check if the node to be updated is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external;

    /// @dev Removes a member from an existing group. A proof of membership is
    /// needed to check if the node to be removed is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment to be removed.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external;
}
