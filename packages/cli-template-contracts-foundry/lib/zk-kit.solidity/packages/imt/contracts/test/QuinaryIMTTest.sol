// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import {QuinaryIMT, QuinaryIMTData} from "../QuinaryIMT.sol";

contract QuinaryIMTTest {
    QuinaryIMTData public data;

    function init(uint256 depth) external {
        QuinaryIMT.init(data, depth, 0);
    }

    function insert(uint256 leaf) external {
        QuinaryIMT.insert(data, leaf);
    }

    function update(
        uint256 leaf,
        uint256 newLeaf,
        uint256[4][] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external {
        QuinaryIMT.update(data, leaf, newLeaf, proofSiblings, proofPathIndices);
    }

    function remove(uint256 leaf, uint256[4][] calldata proofSiblings, uint8[] calldata proofPathIndices) external {
        QuinaryIMT.remove(data, leaf, proofSiblings, proofPathIndices);
    }
}
