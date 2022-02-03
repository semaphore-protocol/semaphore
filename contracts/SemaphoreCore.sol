//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./Verifier.sol";

/// @title Semaphore core contract.
/// @notice Minimal code to allow users to signal their endorsement of an arbitrary string.
/// @dev The following code verifies that the proof is correct and saves the hash of the
/// nullifier to prevent double-signaling. External nullifier and Merkle trees (i.e. groups) must be
/// managed externally.
contract SemaphoreCore is Verifier {
  /// @notice Emitted when a proof is verified correctly and a new nullifier hash is added.
  /// @param nullifierHash: Hash of external and identity nullifiers.
  event nullifierHashAdded(uint256 nullifierHash);

  /// @notice Gets a nullifier hash and returns true or false.
  /// @dev It is used to prevent double-signaling.
  mapping(uint256 => bool) internal nullifierHashes;

  /// @dev Checks if a nullifier already exists and if the zero-knowledge
  /// Semaphore proof is valid.
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
    require(nullifierHashes[_nullifierHash] == false, "SemaphoreCore: you cannot use the same nullifier twice");

    uint256 signalHash = hashSignal(_signal);

    uint256[4] memory publicSignals = [_root, _nullifierHash, signalHash, _externalNullifier];

    require(
      verifyProof(
        [_proof[0], _proof[1]],
        [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
        [_proof[6], _proof[7]],
        publicSignals
      ),
      "Semaphore: the proof is not valid"
    );

    _;

    // Store the nullifier hash to prevent double-signaling.
    nullifierHashes[_nullifierHash] = true;
  }

  /// @dev Creates a keccak256 hash of the signal.
  /// @param _signal: Semaphore signal.
  /// @return Hash of the signal.
  function hashSignal(bytes memory _signal) internal pure returns (uint256) {
    return uint256(keccak256(_signal)) >> 8;
  }
}
