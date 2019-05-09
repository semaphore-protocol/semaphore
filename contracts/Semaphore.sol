pragma solidity >=0.4.21;

import "./verifier.sol";
import "./MerkleTree.sol";

contract Semaphore is Verifier, MerkleTree {
    address public owner;

    uint256 external_nullifier;

    uint8 constant root_history_size = 100;
    uint256[root_history_size] root_history;
    uint8 current_root_index = 0;

    event SignalBroadcast(bytes signal, uint256 externl_nullifier);

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
        root_history[current_root_index++ % root_history_size] = root;
    }

    function updateIdentity(uint256 leaf, uint32 leaf_index, uint256[] memory path) public onlyOwner {
        update(leaf, leaf_index, path);
        root_history[current_root_index++ % root_history_size] = root;
    }

    function broadcastSignal(
        bytes memory signal, 
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[4] input // (root, nullifiers_hash, signal_hash, external_nullifier)
    ) public {
        uint256 signal_hash = uint256(sha256(signal) >> 8);
        require(signal_hash == input[2]);
        require(external_nullifier == input[3]);
        require(verifyProof(a, b, c, input));

        bool found_root = false;
        for (uint8 i = 0; i < root_history_size; i++) {
            if (root_history[i] == input[0]) {
                found_root = true;
                break;
            }
        }
        require(found_root);

        emit SignalBroadcast(signal, input[1]);
    }
}