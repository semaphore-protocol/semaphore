pragma solidity >=0.4.21;

import "./MerkleTree.sol";

contract MerkleTreeTester is MerkleTree {
    constructor() MerkleTree(2, 4) public {

    }
    function insert_test(uint256 leaf) public {
        insert(leaf);
    }
}