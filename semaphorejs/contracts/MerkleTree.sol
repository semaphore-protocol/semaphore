pragma solidity >=0.4.21;

library MiMC {
    function MiMCpe7(uint256 in_x, uint256 in_k)  pure public returns (uint256 out_x);
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
        uint256 intermediate = MiMC.MiMCpe7(15021630795539610737508582392395901278341266317943626182700664337106830745361, left);
        mimc_hash = MiMC.MiMCpe7(intermediate, right);
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