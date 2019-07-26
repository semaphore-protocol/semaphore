/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

pragma solidity >=0.4.21;

import "./verifier.sol";
import "./MerkleTreeLib.sol";
import "./Ownable.sol";

contract Semaphore is Verifier, MultipleMerkleTree, Ownable {
    uint256 public external_nullifier;
    uint8 signal_tree_index;
    uint8 id_tree_index;

    uint8 constant root_history_size = 100;
    uint256[root_history_size] root_history;
    uint8 current_root_index = 0;

    mapping (uint => bool) nullifiers_set;

    uint256 reward;

    event SignalBroadcast(bytes signal, uint256 nullifiers_hash, uint256 external_nullifier);

    uint256 public gas_price_max = 30000000000;

    constructor(uint8 tree_levels, uint256 zero_value, uint256 external_nullifier_in, uint256 reward_amount_in_max_gas_price) Ownable() public 
    {

        external_nullifier = external_nullifier_in;
        id_tree_index = init_tree(tree_levels, zero_value);
        signal_tree_index = init_tree(tree_levels, zero_value);

        reward = reward_amount_in_max_gas_price;
    }

    event Funded(uint256 amount);

    function fund() public payable {
      emit Funded(msg.value);
    }

    function insertIdentity(uint256 leaf) public onlyOwner {
        insert(id_tree_index, leaf);
        root_history[current_root_index++ % root_history_size] = tree_roots[id_tree_index];
    }

    function updateIdentity(uint256 old_leaf, uint256 leaf, uint32 leaf_index, uint256[] memory old_path, uint256[] memory path) public onlyOwner {
        update(id_tree_index, old_leaf, leaf, leaf_index, old_path, path);
        root_history[current_root_index++ % root_history_size] = tree_roots[id_tree_index];
    }

    function preBroadcastVerification (
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[5] input,
        uint256 signal_hash
    ) public view returns (bool) {

        bool correctInputs = 
            signal_hash == input[2] &&
            external_nullifier == input[3] &&
            verifyProof(a, b, c, input) &&
            nullifiers_set[input[1]] == false &&
            address(input[4]) == msg.sender;

        bool found_root = false;
        for (uint8 i = 0; i < root_history_size; i++) {
            if (root_history[i] == input[0]) {
                found_root = true;
                break;
            }
        }

        bool isValid = found_root && correctInputs;

        return isValid;
    }

    function broadcastSignal(
        bytes memory signal,
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[5] input // (root, nullifiers_hash, signal_hash, external_nullifier, broadcaster_address)
    ) public {
        uint256 start_gas = gasleft();
        uint256 signal_hash = uint256(sha256(signal)) >> 8;

        // Check and verify the proof and inputs
        require(preBroadcastVerification(a, b, c, input, signal_hash));

        insert(signal_tree_index, signal_hash);
        nullifiers_set[input[1]] = true;
        emit SignalBroadcast(signal, input[1], external_nullifier);

        uint256 gas_price = gas_price_max;
        if (tx.gasprice < gas_price) {
          gas_price = tx.gasprice;
        }
        uint256 gas_used = start_gas - gasleft();

        // pay back gas: 21000 constant cost + gas used + reward
        //require((msg.sender).send((21000 + gas_used)*tx.gasprice + reward));
        require((msg.sender).send((21000 + gas_used + reward)*gas_price));
        //require(msg.sender.send(1 wei));
    }

    function roots(uint8 tree_index) public view returns (uint256 root) {
      root = tree_roots[tree_index];
    }

    function getIdTreeIndex() public view returns (uint8 index) {
      index = id_tree_index;
    }

    function getSignalTreeIndex() public  view returns (uint8 index) {
      index = signal_tree_index;
    }

    function setExternalNullifier(uint256 new_external_nullifier) public onlyOwner {
      external_nullifier = new_external_nullifier;
    }

    function setMaxGasPrice(uint256 new_max_gas_price) public onlyOwner {
      gas_price_max = new_max_gas_price;
    }
}
