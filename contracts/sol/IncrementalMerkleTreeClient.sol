pragma solidity ^0.5.0;

import { IncrementalMerkleTree } from './IncrementalMerkleTree.sol';

contract IncrementalMerkleTreeClient is IncrementalMerkleTree{
    function initMerkleTreeAsClient(uint8 _treeLevels, uint256 _zeroValue) public {
        return initMerkleTree(_treeLevels, _zeroValue);
    }

    function insertLeafAsClient(uint256 _leaf) public {
        insertLeaf(_leaf);
    }
}
