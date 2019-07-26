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

pragma solidity ^0.5.0;

import "./verifier.sol";
import "./MerkleTreeLib.sol";
import "./Ownable.sol";

contract Semaphore is Verifier, MultipleMerkleTree, Ownable {
    uint256 public external_nullifier;
    uint8 public id_tree_index;

    mapping (uint256 => bool) root_history;
    uint8 current_root_index = 0;

    mapping (uint => bool) nullifiers_set;

    mapping (uint => bytes) public signals;
    uint public current_signal_index = 0;

    event SignalBroadcast(bytes signal, uint256 nullifiers_hash, uint256 external_nullifier);

    constructor(uint8 tree_levels, uint256 zero_value, uint256 external_nullifier_in) Ownable() public
    {
        external_nullifier = external_nullifier_in;
        id_tree_index = init_tree(tree_levels, zero_value);
    }

    event Funded(uint256 amount);

    function fund() public payable {
      emit Funded(msg.value);
    }

    function insertIdentity(uint256 leaf) public onlyOwner {
        insert(id_tree_index, leaf);
        root_history[tree_roots[id_tree_index]] = true;
    }

    function updateIdentity(uint256 old_leaf, uint256 leaf, uint32 leaf_index, uint256[] memory old_path, uint256[] memory path) public onlyOwner {
        update(id_tree_index, old_leaf, leaf, leaf_index, old_path, path);
        root_history[tree_roots[id_tree_index]] = true;
    }

    function broadcastSignal(
        bytes memory signal,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory input // (root, nullifiers_hash, signal_hash, external_nullifier, broadcaster_address)
    ) public {
        uint256 signal_hash = uint256(sha256(signal)) >> 8;
        require(signal_hash == input[2]);
        require(external_nullifier == input[3]);
        require(verifyProof(a, b, c, input));
        require(nullifiers_set[input[1]] == false);
        address broadcaster = address(input[4]);
        require(broadcaster == msg.sender);

        require(root_history[input[0]]);

        signals[current_signal_index++] = signal;
        nullifiers_set[input[1]] = true;
        emit SignalBroadcast(signal, input[1], external_nullifier);
    }

    function roots(uint8 tree_index) public view returns (uint256 root) {
      root = tree_roots[tree_index];
    }

    function leaves(uint8 tree_index) public view returns (uint256[] memory) {
      return tree_leaves[tree_index];
    }

    function leaf(uint8 tree_index, uint256 leaf_index) public view returns (uint256) {
      return tree_leaves[tree_index][leaf_index];
    }

    function getIdTreeIndex() public view returns (uint8 index) {
      index = id_tree_index;
    }

    function setExternalNullifier(uint256 new_external_nullifier) public onlyOwner {
      external_nullifier = new_external_nullifier;
    }
}
