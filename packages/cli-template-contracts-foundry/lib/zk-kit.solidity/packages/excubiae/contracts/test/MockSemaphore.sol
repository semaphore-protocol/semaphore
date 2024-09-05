// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

/// @title Mock Semaphore Contract
/// @notice This contract is a mock implementation of the ISemaphore interface for testing purposes.
/// @dev It simulates the behavior of a real Semaphore contract by simulating the storage and verification
/// of a set of predefined mocked proofs.
contract MockSemaphore is ISemaphore {
    /// @dev Gets a group id and returns the relative group.
    mapping(uint256 => bool) public mockedGroups;

    /// @notice A mapping to store mocked proofs by their unique nullifiers.
    mapping(uint256 => bool) private mockedProofs;

    /// @dev Counter to assign an incremental id to the groups.
    /// This counter is used to keep track of the number of groups created.
    uint256 public groupCounter;

    /// MOCKS ///
    /// @notice Constructor to initialize the mock contract with predefined proofs.
    /// @param _groupIds An array of identifiers of groups to be intended as the contract managed groups.
    /// @param _nullifiers An array of nullifiers to be mocked as proofs.
    /// @param _validities An array of booleans to mock the validity of proofs associated with the nullifiers.
    constructor(uint256[] memory _groupIds, uint256[] memory _nullifiers, bool[] memory _validities) {
        for (uint256 i = 0; i < _groupIds.length; i++) {
            mockedGroups[_groupIds[i]] = true;
            groupCounter++;
        }

        for (uint256 i = 0; i < _nullifiers.length; i++) {
            mockedProofs[_nullifiers[i]] = _validities[i];
        }
    }

    function verifyProof(uint256 groupId, SemaphoreProof calldata proof) external view returns (bool) {
        return mockedGroups[groupId] && mockedProofs[proof.nullifier];
    }

    /// STUBS ///
    // The following functions are stubs and do not perform any meaningful operations.
    // They are placeholders to comply with the IEAS interface.
    function createGroup() external pure override returns (uint256) {
        return 0;
    }

    function createGroup(address /*admin*/) external pure override returns (uint256) {
        return 0;
    }

    function createGroup(address /*admin*/, uint256 /*merkleTreeDuration*/) external pure override returns (uint256) {
        return 0;
    }

    function updateGroupAdmin(uint256 /*groupId*/, address /*newAdmin*/) external override {}

    function acceptGroupAdmin(uint256 /*groupId*/) external override {}

    function updateGroupMerkleTreeDuration(uint256 /*groupId*/, uint256 /*newMerkleTreeDuration*/) external override {}

    function addMember(uint256 groupId, uint256 identityCommitment) external override {}

    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external override {}

    function updateMember(
        uint256 /*groupId*/,
        uint256 /*oldIdentityCommitment*/,
        uint256 /*newIdentityCommitment*/,
        uint256[] calldata /*merkleProofSiblings*/
    ) external override {}

    function removeMember(
        uint256 /*groupId*/,
        uint256 /*identityCommitment*/,
        uint256[] calldata /*merkleProofSiblings*/
    ) external override {}

    function validateProof(uint256 /*groupId*/, SemaphoreProof calldata /*proof*/) external override {}
}
