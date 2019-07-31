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
    bool public is_broadcast_permissioned = true;

    mapping (uint256 => bool) root_history;
    uint8 current_root_index = 0;

    mapping (uint => bool) nullifiers_set;

    mapping (uint => bytes) public signals;
    uint public current_signal_index = 0;

    event SignalBroadcast(bytes signal, uint256 nullifiers_hash, uint256 external_nullifier);

    modifier onlyOwnerIfPermissioned() {
        require(!is_broadcast_permissioned || isOwner(), "onlyOwnerIfPermissioned: caller is not the owner");
        _;
    }

    constructor(uint8 tree_levels, uint256 zero_value, uint256 external_nullifier_in) Ownable() public
    {
        external_nullifier = external_nullifier_in;
        id_tree_index = init_tree(tree_levels, zero_value);
    }


    function insertIdentity(uint256 leaf) public onlyOwner {
        insert(id_tree_index, leaf);
        root_history[tree_roots[id_tree_index]] = true;
    }

    function updateIdentity(uint256 old_leaf, uint256 leaf, uint32 leaf_index, uint256[] memory old_path, uint256[] memory path) public onlyOwner {
        update(id_tree_index, old_leaf, leaf, leaf_index, old_path, path);
        root_history[tree_roots[id_tree_index]] = true;
    }

    function hasNullifier(uint n) public view returns (bool) {
        return nullifiers_set[n];
    }

    function isInRootHistory(uint n) public view returns (bool) {
        return root_history[n];
    }

    function preBroadcastCheck (
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input,
        uint256 signal_hash
    ) public view returns (bool) {
        return hasNullifier(input[1]) == false &&
            signal_hash == input[2] &&
            external_nullifier == input[3] &&
            isInRootHistory(input[0]) &&
            verifyProof(a, b, c, input);
    }

    function preBroadcastRequire (
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input,
        uint256 signal_hash
    ) public {
        require(hasNullifier(input[1]) == false, "Semaphore: nullifier already seen");
        require(signal_hash == input[2], "Semaphore: signal hash mismatch");
        require(external_nullifier == input[3], "Semaphore: external nullifier mismatch");
        require(isInRootHistory(input[0]), "Semaphore: root not seen");
        require(verifyProof(a, b, c, input), "Semaphore: invalid proof");
    }

    function broadcastSignal(
        bytes memory signal,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input // (root, nullifiers_hash, signal_hash, external_nullifier)
    ) public onlyOwnerIfPermissioned {
        // Hash the signal
        uint256 signal_hash = uint256(keccak256(signal)) >> 8;

        // Check the inputs
        preBroadcastRequire(a, b, c, input, signal_hash);

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

    function disablePermissioning() public onlyOwner {
      is_broadcast_permissioned = false;
    }
}
