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

library MiMC {
    function MiMCSponge(uint256 in_xL, uint256 in_xR, uint256 in_k)  pure public returns (uint256 xL, uint256 xR);
}

contract MerkleTree {
    uint8 levels;

    uint256 public root = 0;
    uint256[] public filled_subtrees;
    uint256[] public zeros;

    uint32 public next_index = 0;

    event LeafAdded(uint256 leaf, uint32 leaf_index);
    event LeafUpdated(uint256 leaf, uint32 leaf_index);

    constructor(uint8 tree_levels, uint256 zero_value) public {
        levels = tree_levels;

        zeros.push(zero_value);
        filled_subtrees.push(zeros[0]);

        for (uint8 i = 1; i < levels; i++) {
            zeros.push(HashLeftRight(zeros[i-1], zeros[i-1]));
            filled_subtrees.push(zeros[i]);
        }

        root = HashLeftRight(zeros[levels - 1], zeros[levels - 1]);
    }

    function HashLeftRight(uint256 left, uint256 right) public pure returns (uint256 mimc_hash) {
        uint256 k = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        uint256 R = 0;
        uint256 C = 0;

        R = addmod(R, left, k);
        (R, C) = MiMC.MiMCSponge(R, C, 0);

        R = addmod(R, right, k);
        (R, C) = MiMC.MiMCSponge(R, C, 0);

        mimc_hash = R;
    }

    function insert(uint256 leaf) internal {
        uint32 leaf_index = next_index;
        uint32 current_index = next_index;
        next_index += 1;

        uint256 current_level_hash = leaf;
        uint256 left;
        uint256 right;

        for (uint8 i = 0; i < levels; i++) {
            if (current_index % 2 == 0) {
                left = current_level_hash;
                right = zeros[i];

                filled_subtrees[i] = current_level_hash;
            } else {
                left = filled_subtrees[i];
                right = current_level_hash;
            }

            current_level_hash = HashLeftRight(left, right);

            current_index /= 2;
        }

        root = current_level_hash;

        emit LeafAdded(leaf, leaf_index);
    }

    function update(uint256 leaf, uint32 leaf_index, uint256[] memory path) internal {
        uint32 current_index = leaf_index;

        uint256 current_level_hash = leaf;
        uint256 left;
        uint256 right;

        for (uint8 i = 0; i < levels; i++) {
            if (current_index % 2 == 0) {
                left = current_level_hash;
                right = path[i];
            } else {
                left = path[i];
                right = current_level_hash;
            }

            current_level_hash = HashLeftRight(left, right);

            current_index /= 2;
        }

        emit LeafUpdated(leaf, leaf_index);
    }
}
