pragma solidity >=0.4.21;

library MiMC {
    function MiMCpe7(uint256 in_x, uint256 in_k)  pure public returns (uint256 out_x);
}

contract MultipleMerkleTree {
    uint8[] levels;

    uint256[] internal tree_roots;
    uint256[][] filled_subtrees;
    uint256[][] zeros;

    uint32[] next_index;

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

        return uint8(tree_roots.length) - 1;
    }

    function HashLeftRight(uint256 left, uint256 right) public pure returns (uint256 mimc_hash) {
        uint256 intermediate = MiMC.MiMCpe7(15021630795539610737508582392395901278341266317943626182700664337106830745361, left);
        mimc_hash = MiMC.MiMCpe7(intermediate, right);
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

        require(tree_roots[tree_index] == current_level_hash);

        current_index = leaf_index;

        current_level_hash = leaf;

        for (i = 0; i < levels[tree_index]; i++) {
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

        emit LeafUpdated(tree_index, leaf, leaf_index);
    }
}
