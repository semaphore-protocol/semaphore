// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import {LeanIMT, LeanIMTData} from "../LeanIMT.sol";

contract LeanIMTTest {
    LeanIMTData public data;

    function insert(uint256 leaf) external {
        LeanIMT.insert(data, leaf);
    }

    function insertMany(uint256[] calldata leaves) external {
        LeanIMT.insertMany(data, leaves);
    }

    function update(uint256 oldLeaf, uint256 newLeaf, uint256[] calldata siblingNodes) external {
        LeanIMT.update(data, oldLeaf, newLeaf, siblingNodes);
    }

    function remove(uint256 leaf, uint256[] calldata siblingNodes) external {
        LeanIMT.remove(data, leaf, siblingNodes);
    }

    function has(uint256 leaf) external view returns (bool) {
        return LeanIMT.has(data, leaf);
    }

    function indexOf(uint256 leaf) external view returns (uint256) {
        return LeanIMT.indexOf(data, leaf);
    }

    function root() public view returns (uint256) {
        return LeanIMT.root(data);
    }
}
