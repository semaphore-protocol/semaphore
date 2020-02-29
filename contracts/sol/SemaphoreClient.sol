/*
 * Semaphore - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2020 Barry WhiteHat <barrywhitehat@protonmail.com>, Kobi
 * Gurkan <kobigurk@gmail.com> and Koh Wei Jie (contact@kohweijie.com)
 *
 * This file is part of Semaphore.
 *
 * Semaphore is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Semaphore is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Semaphore.  If not, see <http://www.gnu.org/licenses/>.
 */

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

    function addExternalNullifier(uint232 _externalNullifier) public {
        semaphore.addExternalNullifier(_externalNullifier);
    }

    function deactivateExternalNullifier(uint232 _externalNullifier) public {
        semaphore.deactivateExternalNullifier(_externalNullifier);
    }

    function reactivateExternalNullifier(uint232 _externalNullifier) public {
        semaphore.reactivateExternalNullifier(_externalNullifier);
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
        nextSignalIndex ++;

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

    function setPermissioning(bool _newPermission) public {
        semaphore.setPermissioning(_newPermission);
    }
}
