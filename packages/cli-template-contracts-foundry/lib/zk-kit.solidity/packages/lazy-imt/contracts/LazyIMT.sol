// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {InternalLazyIMT, LazyIMTData} from "./InternalLazyIMT.sol";

library LazyIMT {
    using InternalLazyIMT for *;

    function init(LazyIMTData storage self, uint8 depth) public {
        InternalLazyIMT._init(self, depth);
    }

    function defaultZero(uint8 index) public pure returns (uint256) {
        return InternalLazyIMT._defaultZero(index);
    }

    function reset(LazyIMTData storage self) public {
        InternalLazyIMT._reset(self);
    }

    function indexForElement(uint8 level, uint40 index) public pure returns (uint40) {
        return InternalLazyIMT._indexForElement(level, index);
    }

    function insert(LazyIMTData storage self, uint256 leaf) public {
        InternalLazyIMT._insert(self, leaf);
    }

    function update(LazyIMTData storage self, uint256 leaf, uint40 index) public {
        InternalLazyIMT._update(self, leaf, index);
    }

    function root(LazyIMTData storage self) public view returns (uint256) {
        return InternalLazyIMT._root(self);
    }

    function root(LazyIMTData storage self, uint8 depth) public view returns (uint256) {
        return InternalLazyIMT._root(self, depth);
    }

    function merkleProofElements(
        LazyIMTData storage self,
        uint40 index,
        uint8 depth
    ) public view returns (uint256[] memory) {
        return InternalLazyIMT._merkleProofElements(self, index, depth);
    }

    function _root(LazyIMTData storage self, uint40 numberOfLeaves, uint8 depth) internal view returns (uint256) {
        return InternalLazyIMT._root(self, numberOfLeaves, depth);
    }
}
