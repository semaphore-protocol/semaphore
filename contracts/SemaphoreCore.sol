//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./interfaces/ISemaphoreCore.sol";
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
  /// @param _signal: Semaphore signal.
  /// @param _root: Root of the Merkle tree.
  /// @param _nullifierHash: Nullifier hash.
  /// @param _externalNullifier: External nullifier.
  /// @param _proof: Zero-knowledge proof.
  modifier onlyValidProof(
    bytes memory _signal,
    uint256 _root,
    uint256 _nullifierHash,
    uint256 _externalNullifier,
    uint256[8] calldata _proof
  ) {
    require(
      _isValidProof(_signal, _root, _nullifierHash, _externalNullifier, _proof),
      "SemaphoreCore: the proof is not valid"
    );

    _;
  }

  /// @dev Returns true if no nullifier already exists and if the zero-knowledge proof is valid.
  /// Otherwise it returns false.
  /// @param _signal: Semaphore signal.
  /// @param _root: Root of the Merkle tree.
  /// @param _nullifierHash: Nullifier hash.
  /// @param _externalNullifier: External nullifier.
  /// @param _proof: Zero-knowledge proof.
  function _isValidProof(
    bytes memory _signal,
    uint256 _root,
    uint256 _nullifierHash,
    uint256 _externalNullifier,
    uint256[8] calldata _proof
  ) internal view returns (bool) {
    require(nullifierHashes[_nullifierHash] == false, "SemaphoreCore: you cannot use the same nullifier twice");

    uint256 signalHash = _hashSignal(_signal);

    uint256[4] memory publicSignals = [_root, _nullifierHash, signalHash, _externalNullifier];

    return
      verifyProof(
        [_proof[0], _proof[1]],
        [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
        [_proof[6], _proof[7]],
        publicSignals
      );
  }

  /// @dev Stores the nullifier hash to prevent double-signaling.
  /// Attention! Remember to call it when you verify a proof if you
  /// need to prevent double-signaling.
  /// @param _nullifierHash: Semaphore nullifier hash.
  function _saveNullifierHash(uint256 _nullifierHash) internal {
    nullifierHashes[_nullifierHash] = true;
  }

  /// @dev Creates a keccak256 hash of the signal.
  /// @param _signal: Semaphore signal.
  /// @return Hash of the signal.
  function _hashSignal(bytes memory _signal) private pure returns (uint256) {
    return uint256(keccak256(_signal)) >> 8;
  }
}
