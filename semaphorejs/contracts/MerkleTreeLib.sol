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

contract MultipleMerkleTree {
    uint8[] levels;

    uint256[] internal tree_roots;
    uint256[][] filled_subtrees;
    uint256[][] zeros;

    uint32[] next_index;

    uint256[][] internal tree_leaves;

    event LeafAdded(uint8 tree_index, uint256 leaf, uint32 leaf_index);
    event LeafUpdated(uint8 tree_index, uint256 leaf, uint32 leaf_index);

    function init_tree(uint8 tree_levels, uint256 zero_value) public returns (uint8 tree_index) {
        levels.push(tree_levels);

        uint256[] memory current_zeros = new uint256[](tree_levels);
        current_zeros[0] = zero_value;

        uint256[] memory current_filled_subtrees = new uint256[](tree_levels);
        current_filled_subtrees[0] = current_zeros[0];

        for (uint8 i = 1; i < tree_levels; i++) {
            current_zeros[i] = HashLeftRight(current_zeros[i-1], current_zeros[i-1]);
            current_filled_subtrees[i] = current_zeros[i];
        }

        zeros.push(current_zeros);
        filled_subtrees.push(current_filled_subtrees);

        tree_roots.push(HashLeftRight(current_zeros[tree_levels - 1], current_zeros[tree_levels - 1]));
        next_index.push(0);

        tree_leaves.push(new uint256[](0));

        return uint8(tree_roots.length) - 1;
    }

    function HashLeftRight(uint256 left, uint256 right) public pure returns (uint256 mimc_hash) {
        uint256 k =  21888242871839275222246405745257275088548364400416034343698204186575808495617;
        uint256 R = 0;
        uint256 C = 0;

        R = addmod(R, left, k);
        (R, C) = MiMC.MiMCSponge(R, C, 0);

        R = addmod(R, right, k);
        (R, C) = MiMC.MiMCSponge(R, C, 0);

        mimc_hash = R;
    }

    function insert(uint8 tree_index, uint256 leaf) internal {
        uint32 leaf_index = next_index[tree_index];
        uint32 current_index = next_index[tree_index];
        next_index[tree_index] += 1;

        uint256 current_level_hash = leaf;
        uint256 left;
        uint256 right;

        for (uint8 i = 0; i < levels[tree_index]; i++) {
            if (current_index % 2 == 0) {
                left = current_level_hash;
                right = zeros[tree_index][i];

                filled_subtrees[tree_index][i] = current_level_hash;
            } else {
                left = filled_subtrees[tree_index][i];
                right = current_level_hash;
            }

            current_level_hash = HashLeftRight(left, right);

            current_index /= 2;
        }

        tree_roots[tree_index] = current_level_hash;

        tree_leaves[tree_index].push(leaf);
        emit LeafAdded(tree_index, leaf, leaf_index);
    }

    function update(uint8 tree_index, uint256 old_leaf, uint256 leaf, uint32 leaf_index, uint256[] memory old_path, uint256[] memory path) internal {
        uint32 current_index = leaf_index;

        uint256 current_level_hash = old_leaf;
        uint256 left;
        uint256 right;

        for (uint8 i = 0; i < levels[tree_index]; i++) {
            if (current_index % 2 == 0) {
                left = current_level_hash;
                right = old_path[i];
            } else {
                left = old_path[i];
                right = current_level_hash;
            }

            current_level_hash = HashLeftRight(left, right);

            current_index /= 2;
        }

        require(tree_roots[tree_index] == current_level_hash, "MultipleMerkleTree: tree root / current level hash mismatch");

        current_index = leaf_index;

        current_level_hash = leaf;

        for (uint8 i = 0; i < levels[tree_index]; i++) {
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

        tree_roots[tree_index] = current_level_hash;

        tree_leaves[tree_index][leaf_index] = leaf;
        emit LeafUpdated(tree_index, leaf, leaf_index);
    }
}
