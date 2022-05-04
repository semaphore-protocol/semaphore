// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/ISemaphore.sol";
import "./interfaces/IVerifier.sol";
import "./base/SemaphoreCore.sol";
import "./base/SemaphoreGroups.sol";

/// @title Semaphore
contract Semaphore is ISemaphore, SemaphoreCore, SemaphoreGroups {
  /// @dev Gets a tree depth and returns its verifier address.
  mapping(uint8 => IVerifier) public verifiers;

  /// @dev Gets a group id and returns the group admin address.
  mapping(uint256 => address) public groupAdmins;

  /// @dev Checks if the group admin is the transaction sender.
  /// @param groupId: Id of the group.
  modifier onlyGroupAdmin(uint256 groupId) {
    require(groupAdmins[groupId] == _msgSender(), "Semaphore: caller is not the group admin");
    _;
  }

  /// @dev Checks if there is a verifier for the given tree depth.
  /// @param depth: Depth of the tree.
  modifier onlySupportedDepth(uint8 depth) {
    require(address(verifiers[depth]) != address(0), "Semaphore: tree depth is not supported");
    _;
  }

  /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
  /// @param _verifiers: List of Semaphore verifiers (address and related Merkle tree depth).
  constructor(Verifier[] memory _verifiers) {
    for (uint8 i = 0; i < _verifiers.length; i++) {
      verifiers[_verifiers[i].merkleTreeDepth] = IVerifier(_verifiers[i].contractAddress);
    }
  }

  /// @dev See {ISemaphore-createGroup}.
  function createGroup(
    uint256 groupId,
    uint8 depth,
    address admin
  ) external override onlySupportedDepth(depth) {
    _createGroup(groupId, depth, 0);

    groupAdmins[groupId] = admin;

    emit GroupAdminUpdated(groupId, address(0), admin);
  }

  /// @dev See {ISemaphore-updateGroupAdmin}.
  function updateGroupAdmin(uint256 groupId, address newAdmin) external override onlyGroupAdmin(groupId) {
    groupAdmins[groupId] = newAdmin;

    emit GroupAdminUpdated(groupId, _msgSender(), newAdmin);
  }

  /// @dev See {ISemaphore-addMember}.
  function addMember(uint256 groupId, uint256 identityCommitment) external override onlyGroupAdmin(groupId) {
    _addMember(groupId, identityCommitment);
  }

  /// @dev See {ISemaphore-removeMember}.
  function removeMember(
    uint256 groupId,
    uint256 identityCommitment,
    uint256[] calldata proofSiblings,
    uint8[] calldata proofPathIndices
  ) external override onlyGroupAdmin(groupId) {
    _removeMember(groupId, identityCommitment, proofSiblings, proofPathIndices);
  }

  /// @dev See {ISemaphore-verifyProof}.
  function verifyProof(
    uint256 groupId,
    bytes32 signal,
    uint256 nullifierHash,
    uint256 externalNullifier,
    uint256[8] calldata proof
  ) external override {
    uint256 root = getRoot(groupId);
    uint8 depth = getDepth(groupId);

    require(depth != 0, "Semaphore: group does not exist");

    IVerifier verifier = verifiers[depth];

    _verifyProof(signal, root, nullifierHash, externalNullifier, proof, verifier);

    _saveNullifierHash(nullifierHash);

    emit ProofVerified(groupId, signal);
  }
}
