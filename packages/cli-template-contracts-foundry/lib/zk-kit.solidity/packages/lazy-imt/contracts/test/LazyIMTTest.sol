// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import {LazyIMT, LazyIMTData} from "../LazyIMT.sol";

contract LazyIMTTest {
    LazyIMTData public data;
    uint256 _root;

    function init(uint8 depth) public {
        LazyIMT.init(data, depth);
    }

    function reset() public {
        LazyIMT.reset(data);
    }

    function insert(uint256 leaf) public {
        LazyIMT.insert(data, leaf);
    }

    function update(uint256 leaf, uint40 index) public {
        LazyIMT.update(data, leaf, index);
    }

    // for benchmarking the root cost
    function benchmarkRoot() public {
        _root = LazyIMT.root(data);
    }

    function root() public view returns (uint256) {
        return LazyIMT.root(data);
    }

    function dynamicRoot(uint8 depth) public view returns (uint256) {
        return LazyIMT.root(data, depth);
    }

    function staticRoot(uint8 depth) public view returns (uint256) {
        return LazyIMT.root(data, depth);
    }

    function merkleProofElements(uint40 index, uint8 depth) public view returns (uint256[] memory) {
        return LazyIMT.merkleProofElements(data, index, depth);
    }
}
