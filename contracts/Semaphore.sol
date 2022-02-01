//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./Verifier.sol";

contract Semaphore is Verifier {
  mapping(uint256 => bool) public nullifierHashes;

  modifier isValidProof(
    bytes memory _signal,
    uint256 _root,
    uint256 _nullifierHash,
    uint256 _externalNullifier,
    uint256[8] memory _proof
  ) {
    require(nullifierHashes[_nullifierHash] == false, "Semaphore: you cannot use the same nullifier twice");

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

  function hashSignal(bytes memory _signal) internal pure returns (uint256) {
    return uint256(keccak256(_signal)) >> 8;
  }
}
