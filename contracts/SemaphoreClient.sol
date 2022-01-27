//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {Semaphore} from "./Semaphore.sol";

contract SemaphoreClient {
  // A mapping of all signals broadcasted
  mapping(uint256 => bytes) public signalIndexToSignal;

  // A mapping between signal indices to external nullifiers
  mapping(uint256 => uint256) public signalIndexToExternalNullifier;

  // The next index of the `signalIndexToSignal` mapping
  uint256 public nextSignalIndex = 0;

  Semaphore public semaphore;

  event SignalBroadcastByClient(uint256 indexed signalIndex);

  constructor(Semaphore _semaphore) {
    semaphore = _semaphore;
  }

  function broadcastSignal(
    bytes memory _signal,
    uint256[8] memory _proof,
    uint256 _root,
    uint256 _nullifiersHash,
    uint232 _externalNullifier
  ) public {
    uint256 signalIndex = nextSignalIndex;

    // store the signal
    signalIndexToSignal[nextSignalIndex] = _signal;

    // map the the signal index to the given external nullifier
    signalIndexToExternalNullifier[nextSignalIndex] = _externalNullifier;

    // increment the signal index
    nextSignalIndex++;

    // broadcast the signal
    semaphore.broadcastSignal(_signal, _proof, _root, _nullifiersHash, _externalNullifier);

    emit SignalBroadcastByClient(signalIndex);
  }

  /*
   * Returns the external nullifier which a signal at _index broadcasted to
   * @param _index The index to use to look up the signalIndexToExternalNullifier mapping
   */
  function getExternalNullifierBySignalIndex(uint256 _index) public view returns (uint256) {
    return signalIndexToExternalNullifier[_index];
  }

  function getSignalBySignalIndex(uint256 _index) public view returns (bytes memory) {
    return signalIndexToSignal[_index];
  }
}
