//SPDX-License-Identifier: MIT
pragma solidity >=0.8.23 <0.9.0;

import {ISemaphoreGroups} from "../interfaces/ISemaphoreGroups.sol";
import {InternalLeanIMT, LeanIMTData} from "@zk-kit/lean-imt.sol/InternalLeanIMT.sol";

/// @title Semaphore groups contract.
/// @dev This contract allows you to create groups, add, remove and update members.
/// You can use getters to obtain informations about groups (root, depth, number of leaves).
abstract contract SemaphoreGroups is ISemaphoreGroups {
    using InternalLeanIMT for LeanIMTData;

    /// @dev Gets a group id and returns its tree data.
    /// The tree is an Incremental Merkle Tree
    /// which is called Lean Incremental Merkle Tree.
    mapping(uint256 => LeanIMTData) internal merkleTrees;

    /// @dev Gets a group id and returns its admin.
    /// The admin can be an Ethereum account or a smart contract.
    mapping(uint256 => address) internal admins;

    /// @dev Gets a group id and returns any pending admin.
    /// The pending admin can be an Ethereum account or a smart contract.
    mapping(uint256 => address) internal pendingAdmins;

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        if (admins[groupId] != msg.sender) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
        _;
    }

    /// @dev Checks if the group exists.
    /// @param groupId: Id of the group.
    modifier onlyExistingGroup(uint256 groupId) {
        if (admins[groupId] == address(0)) {
            revert Semaphore__GroupDoesNotExist();
        }

        _;
    }

    /// @dev Creates a new group. Only the admin will be able to add or remove members.
    /// @param groupId: Id of the group.
    /// @param admin: Admin of the group.
    function _createGroup(uint256 groupId, address admin) internal virtual {
        admins[groupId] = admin;

        emit GroupCreated(groupId);
        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev Updates the group admin. In order for the new admin to actually be updated,
    /// they must explicitly accept by calling `_acceptGroupAdmin`.
    /// @param groupId: Id of the group.
    /// @param newAdmin: New admin of the group.
    function _updateGroupAdmin(uint256 groupId, address newAdmin) internal virtual onlyGroupAdmin(groupId) {
        pendingAdmins[groupId] = newAdmin;

        emit GroupAdminPending(groupId, msg.sender, newAdmin);
    }

    /// @dev Allows the new admin to accept to update the group admin with their address.
    /// @param groupId: Id of the group.
    function _acceptGroupAdmin(uint256 groupId) internal virtual {
        if (pendingAdmins[groupId] != msg.sender) {
            revert Semaphore__CallerIsNotThePendingGroupAdmin();
        }

        address oldAdmin = admins[groupId];

        admins[groupId] = msg.sender;

        delete pendingAdmins[groupId];

        emit GroupAdminUpdated(groupId, oldAdmin, msg.sender);
    }

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    /// @return merkleTreeRoot New root hash of the tree.
    function _addMember(
        uint256 groupId,
        uint256 identityCommitment
    ) internal virtual onlyGroupAdmin(groupId) returns (uint256 merkleTreeRoot) {
        uint256 index = getMerkleTreeSize(groupId);
        merkleTreeRoot = merkleTrees[groupId]._insert(identityCommitment);

        emit MemberAdded(groupId, index, identityCommitment, merkleTreeRoot);
    }

    /// @dev Adds new members to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitments: New identity commitments.
    /// @return merkleTreeRoot New root hash of the tree.
    function _addMembers(
        uint256 groupId,
        uint256[] calldata identityCommitments
    ) internal virtual onlyGroupAdmin(groupId) returns (uint256 merkleTreeRoot) {
        uint256 startIndex = getMerkleTreeSize(groupId);
        merkleTreeRoot = merkleTrees[groupId]._insertMany(identityCommitments);

        emit MembersAdded(groupId, startIndex, identityCommitments, merkleTreeRoot);
    }

    /// @dev Updates an identity commitment of an existing group. A proof of membership is
    /// needed to check if the node to be updated is part of the tree.
    /// @param groupId: Id of the group.
    /// @param oldIdentityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    /// @return merkleTreeRoot New root hash of the tree.
    function _updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) internal virtual onlyGroupAdmin(groupId) returns (uint256 merkleTreeRoot) {
        uint256 index = merkleTrees[groupId]._indexOf(oldIdentityCommitment);
        merkleTreeRoot = merkleTrees[groupId]._update(
            oldIdentityCommitment,
            newIdentityCommitment,
            merkleProofSiblings
        );

        emit MemberUpdated(groupId, index, oldIdentityCommitment, newIdentityCommitment, merkleTreeRoot);
    }

    /// @dev Removes an identity commitment from an existing group. A proof of membership is
    /// needed to check if the node to be deleted is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be removed.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    /// @return merkleTreeRoot New root hash of the tree.
    function _removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) internal virtual onlyGroupAdmin(groupId) returns (uint256 merkleTreeRoot) {
        uint256 index = merkleTrees[groupId]._indexOf(identityCommitment);

        merkleTreeRoot = merkleTrees[groupId]._remove(identityCommitment, merkleProofSiblings);

        emit MemberRemoved(groupId, index, identityCommitment, merkleTreeRoot);
    }

    /// @dev See {ISemaphoreGroups-getGroupAdmin}.
    function getGroupAdmin(uint256 groupId) public view virtual override returns (address) {
        return admins[groupId];
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
