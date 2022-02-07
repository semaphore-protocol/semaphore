//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "../interfaces/ISemaphoreCore.sol";
import "./Verifier.sol";

/// @title Semaphore core contract.
/// @notice Minimal code to allow users to signal their endorsement of an arbitrary string.
/// @dev The following code verifies that the proof is correct and saves the hash of the
/// nullifier to prevent double-signaling. External nullifier and Merkle trees (i.e. groups) must be
/// managed externally.
contract SemaphoreCore is ISemaphoreCore, Verifier {
  /// @dev Gets a nullifier hash and returns true or false.
  /// It is used to prevent double-signaling.
  mapping(uint256 => bool) internal nullifierHashes;

  /// @dev Checks if the proof is valid.
  /// @param signal: Semaphore signal.
  /// @param root: Merkle tree root.
  /// @param nullifierHash: Nullifier hash.
  /// @param externalNullifier: External nullifier.
  /// @param proof: Private zk-proof parameters.
  modifier onlyValidProof(
    bytes calldata signal,
    uint256 root,
    uint256 nullifierHash,
    uint256 externalNullifier,
    uint256[8] calldata proof
  ) {
    require(
      _isValidProof(signal, root, nullifierHash, externalNullifier, proof),
      "SemaphoreCore: the proof is not valid"
    );

    _;
  }

  /// @dev Returns true if no nullifier already exists and if the zero-knowledge proof is valid.
  /// Otherwise it returns false.
  /// @param signal: Semaphore signal.
  /// @param root: Root of the Merkle tree.
  /// @param nullifierHash: Nullifier hash.
  /// @param externalNullifier: External nullifier.
  /// @param proof: Zero-knowledge proof.
  function _isValidProof(
    bytes calldata signal,
    uint256 root,
    uint256 nullifierHash,
    uint256 externalNullifier,
    uint256[8] calldata proof
  ) internal view returns (bool) {
    require(nullifierHashes[nullifierHash] == false, "SemaphoreCore: you cannot use the same nullifier twice");

    uint256 signalHash = _hashSignal(signal);

    uint256[4] memory publicSignals = [root, nullifierHash, signalHash, externalNullifier];

    return
      verifyProof(
        [proof[0], proof[1]],
        [[proof[2], proof[3]], [proof[4], proof[5]]],
        [proof[6], proof[7]],
        publicSignals
      );
  }

  /// @dev Stores the nullifier hash to prevent double-signaling.
  /// Attention! Remember to call it when you verify a proof if you
  /// need to prevent double-signaling.
  /// @param nullifierHash: Semaphore nullifier hash.
  function _saveNullifierHash(uint256 nullifierHash) internal {
    nullifierHashes[nullifierHash] = true;
  }

  /// @dev Creates a keccak256 hash of the signal.
  /// @param signal: Semaphore signal.
  /// @return Hash of the signal.
  function _hashSignal(bytes memory signal) private pure returns (uint256) {
    return uint256(keccak256(signal)) >> 8;
  }
}
