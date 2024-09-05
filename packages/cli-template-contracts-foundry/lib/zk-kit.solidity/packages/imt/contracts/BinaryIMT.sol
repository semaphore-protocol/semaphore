// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {InternalBinaryIMT, BinaryIMTData} from "./InternalBinaryIMT.sol";

library BinaryIMT {
    using InternalBinaryIMT for *;

    function defaultZero(uint256 index) public pure returns (uint256) {
        return InternalBinaryIMT._defaultZero(index);
    }

    function init(BinaryIMTData storage self, uint256 depth, uint256 zero) public {
        InternalBinaryIMT._init(self, depth, zero);
    }

    function initWithDefaultZeroes(BinaryIMTData storage self, uint256 depth) public {
        InternalBinaryIMT._initWithDefaultZeroes(self, depth);
    }

    function insert(BinaryIMTData storage self, uint256 leaf) public returns (uint256) {
        return InternalBinaryIMT._insert(self, leaf);
    }

    function update(
        BinaryIMTData storage self,
        uint256 leaf,
        uint256 newLeaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) public {
        InternalBinaryIMT._update(self, leaf, newLeaf, proofSiblings, proofPathIndices);
    }

    function remove(
        BinaryIMTData storage self,
        uint256 leaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) public {
        InternalBinaryIMT._remove(self, leaf, proofSiblings, proofPathIndices);
    }

    function verify(
        BinaryIMTData storage self,
        uint256 leaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) private view returns (bool) {
        return InternalBinaryIMT._verify(self, leaf, proofSiblings, proofPathIndices);
    }
}
