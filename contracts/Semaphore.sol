pragma solidity >=0.4.21;

import "./verifier.sol";
import "./MerkleTree.sol";

contract Semaphore is Verifier, MerkleTree {
    address public owner;

    uint256 external_nullifier;

    event SignalBroadcast(bytes signal);

    constructor(uint8 tree_levels, uint256 zero_value, uint256 external_nullifier_in) MerkleTree(tree_levels, zero_value) public {
        owner = msg.sender;

        external_nullifier = external_nullifier_in;
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function insertIdentity(uint256 leaf) public onlyOwner {
        insert(leaf);
    }

    function updateIdentity(uint256 leaf, uint32 leaf_index, uint256[] memory path) public onlyOwner {
        update(leaf, leaf_index, path);
    }

    function broadcastSignal(
        bytes memory signal, 
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[4] input // (signal_hash, external_nullifier, root, nullifiers_hash)
    ) public {
        uint256 signal_hash = uint256(sha256(signal));
        require(signal_hash == input[0]);
        require(verifyProof(a, b, c, input));

        emit SignalBroadcast(signal);
    }


}