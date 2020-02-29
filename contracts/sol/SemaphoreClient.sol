pragma solidity ^0.5.0;

import { Semaphore } from './Semaphore.sol';

contract SemaphoreClient {
    uint256[] public identityCommitments;

    // A mapping of all signals broadcasted
    mapping (uint256 => bytes) public signalIndexToSignal;

    // A mapping between signal indices to external nullifiers
    mapping (uint256 => uint256) public signalIndexToExternalNullifier;

    // The next index of the `signalIndexToSignal` mapping
    uint256 public nextSignalIndex = 0;

    Semaphore public semaphore;

    event SignalBroadcastByClient(uint256 indexed signalIndex);

    constructor(Semaphore _semaphore) public {
        semaphore = _semaphore;
    }

    function getIdentityCommitments() public view returns (uint256 [] memory) {
        return identityCommitments;
    }

    function getIdentityCommitment(uint256 _index) public view returns (uint256) {
        return identityCommitments[_index];
    }

    function insertIdentityAsClient(uint256 _leaf) public {
        semaphore.insertIdentity(_leaf);
        identityCommitments.push(_leaf);
    }

    function addExternalNullifier(uint256 _externalNullifier) public {
        semaphore.addExternalNullifier(_externalNullifier);
    }

    function deactivateExternalNullifier(uint256 _externalNullifier) public {
        semaphore.deactivateExternalNullifier(_externalNullifier);
    }

    function reactivateExternalNullifier(uint256 _externalNullifier) public {
        semaphore.reactivateExternalNullifier(_externalNullifier);
    }

    function broadcastSignal(
        bytes memory _signal,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256 _root,
        uint256 _nullifiersHash,
        uint256 _externalNullifier
    ) public {
        uint256 signalIndex = nextSignalIndex;

        // store the signal
        signalIndexToSignal[nextSignalIndex] = _signal;

        // map the the signal index to the given external nullifier
        signalIndexToExternalNullifier[nextSignalIndex] = _externalNullifier;

        // increment the signal index
        nextSignalIndex ++;

        // broadcast the signal
        semaphore.broadcastSignal(_signal, _a, _b, _c, _root, _nullifiersHash, _externalNullifier);

        emit SignalBroadcastByClient(signalIndex);
    }

    /*
     * Returns the external nullifier which a signal at _index broadcasted to
     * @param _index The index to use to look up the signalIndexToExternalNullifier mapping
     */
    function getExternalNullifierBySignalIndex(uint256 _index) public view returns (uint256) {
        return signalIndexToExternalNullifier[_index];
    }
}
