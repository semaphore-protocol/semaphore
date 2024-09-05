// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import {BinaryIMT, BinaryIMTData} from "../BinaryIMT.sol";

contract BinaryIMTTest {
    BinaryIMTData public data;

    function init(uint256 depth) external {
        BinaryIMT.init(data, depth, 0);
    }

    function initWithDefaultZeroes(uint256 depth) external {
        BinaryIMT.initWithDefaultZeroes(data, depth);
    }

    function insert(uint256 leaf) external {
        BinaryIMT.insert(data, leaf);
    }

    function update(
        uint256 leaf,
        uint256 newLeaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external {
        BinaryIMT.update(data, leaf, newLeaf, proofSiblings, proofPathIndices);
    }

    function remove(uint256 leaf, uint256[] calldata proofSiblings, uint8[] calldata proofPathIndices) external {
        BinaryIMT.remove(data, leaf, proofSiblings, proofPathIndices);
    }
}
