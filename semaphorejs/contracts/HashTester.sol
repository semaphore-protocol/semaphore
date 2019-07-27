/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

pragma solidity ^0.5.0;

contract HashTester {
    constructor() public {

    }

    event DebugHash(bytes32 normal, uint256 converted, bytes32 normal_shifted, uint256 converted_shifted);
    event DebugRollingHash(uint256 prev_rolling_hash, uint256 signal_hash, uint256 rolling_hash, bytes encoded);

    uint256 rolling_hash = 1238129381923;

    function Test(bytes memory signal) public {
        uint256 signal_hash = uint256(sha256(signal)) >> 8;
        emit DebugHash(sha256(signal), uint256(sha256(signal)), sha256(signal) >> 8, signal_hash);
        bytes memory encoded = abi.encodePacked(rolling_hash, signal_hash);
        uint256 new_rolling_hash = uint256(sha256(encoded));
        emit DebugRollingHash(rolling_hash, signal_hash, new_rolling_hash, encoded);
    }
}
