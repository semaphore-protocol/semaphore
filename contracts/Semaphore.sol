pragma solidity >=0.4.21;

import "./verifier.sol";
import "./MerkleTree.sol";

contract Semaphore is Verifier, MerkleTree {
    address public owner;

    constructor(uint8 tree_levels, uint256 zero_value) MerkleTree(tree_levels, zero_value) public {
    }

    modifier onlyOwner() {
        if (msg.sender == owner) _;
    }

    function insertIdentity(uint256 leaf) {
        insert(leaf);
    }

    function updateIdentity(uint256 leaf, uint32 leaf_index) public onlyOwner {
        uint32 current_index = leaf_index;
    }

    function broadcastSignal(
        bytes memory signal, 
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[4] input
    ) public {

    }


}