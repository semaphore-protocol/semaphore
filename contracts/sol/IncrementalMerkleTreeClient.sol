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

import { IncrementalMerkleTree } from './IncrementalMerkleTree.sol';

contract IncrementalMerkleTreeClient is IncrementalMerkleTree{
    constructor(uint8 _treeLevels, uint256 _zeroValue)
        IncrementalMerkleTree(_treeLevels, _zeroValue)
        public {
    }

    function insertLeafAsClient(uint256 _leaf) public {
        insertLeaf(_leaf);
    }
}
