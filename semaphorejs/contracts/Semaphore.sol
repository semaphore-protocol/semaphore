pragma solidity >=0.4.21;

import "./verifier.sol";
import "./MerkleTreeLib.sol";

contract Semaphore is Verifier, MultipleMerkleTree {
    address public owner;

    uint256 public external_nullifier;
    uint8 signal_tree_index;
    uint8 id_tree_index;

    uint8 constant root_history_size = 100;
    uint256[root_history_size] root_history;
    uint8 current_root_index = 0;

    event SignalBroadcast(bytes signal, uint256 nullifiers_hash, uint256 external_nullifier);

    constructor(uint8 tree_levels, uint256 zero_value, uint256 external_nullifier_in) public {
        owner = msg.sender;

        external_nullifier = external_nullifier_in;
        id_tree_index = init_tree(tree_levels, zero_value);
        signal_tree_index = init_tree(tree_levels, zero_value);
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function insertIdentity(uint256 leaf) public onlyOwner {
        insert(id_tree_index, leaf);
        root_history[current_root_index++ % root_history_size] = tree_roots[id_tree_index];
    }

    function updateIdentity(uint256 old_leaf, uint256 leaf, uint32 leaf_index, uint256[] memory old_path, uint256[] memory path) public onlyOwner {
        update(id_tree_index, old_leaf, leaf, leaf_index, old_path, path);
        root_history[current_root_index++ % root_history_size] = tree_roots[id_tree_index];
    }

    function broadcastSignal(
        bytes memory signal,
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[4] input // (root, nullifiers_hash, signal_hash, external_nullifier)
    ) public {
        uint256 signal_hash = uint256(sha256(signal)) >> 8;
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

        insert(signal_tree_index, signal_hash);
        emit SignalBroadcast(signal, input[1], external_nullifier);
    }

    function roots(uint8 tree_index) public view returns (uint256 root) {
      root = tree_roots[tree_index];
    }

    function get_id_tree_index() public view returns (uint8 index) {
      index = id_tree_index;
    }

    function get_signal_tree_index() public  view returns (uint8 index) {
      index = signal_tree_index;
    }

}
