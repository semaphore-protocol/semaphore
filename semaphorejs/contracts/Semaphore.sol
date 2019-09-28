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
    // The external_nullifier helps to prevent double-signalling by the same
    // user. The active_external_nullifiers mapping allows for quick lookups of the
    // existence of an external nullifier, and the external_nullifier_history
    // allows for easy enumeration of all external nullifiers.
    // Note that external_nullifier_history(index) IS NOT the source of truth
    // about whether an external nullifier exists, as removeExternalNullifier()
    // only sets the boolean of the active_external_nullifiers mapping to false, and
    // doesn't touch external_nullifier_history
    mapping (uint256 => bool) active_external_nullifiers;
    mapping (uint256 => uint256) external_nullifier_history;
    uint256 private next_external_nullifier_history_index;

    uint8 public id_tree_index;

    // Whether broadcastSignal() can only be called by the owner of this
    // contract. This is the case as a safe default.
    bool public is_broadcast_permissioned = true;

    // Whether the contract has already seen a particular Merkle tree root
    mapping (uint256 => bool) root_history;

    uint8 current_root_index = 0;

    // Whether the contract has already seen a particular nullifier hash
    mapping (uint => bool) nullifier_hash_history;

    // All signals broadcasted
    mapping (uint => bytes) public signals;

    // The higest index of the `signals` mapping
    uint public current_signal_index = 0;

    event SignalBroadcast(bytes signal, uint256 nullifiers_hash, uint256 external_nullifier);

    /*
     * If broadcastSignal is permissioned, check if msg.sender is the contract owner
     */
    modifier onlyOwnerIfPermissioned() {
        require(!is_broadcast_permissioned || isOwner(), "Semaphore: broadcast permission denied");
        _;
    }

    constructor(uint8 tree_levels, uint256 zero_value, uint256 first_external_nullifier) Ownable() public {
        addExternalNullifier(first_external_nullifier);
        id_tree_index = init_tree(tree_levels, zero_value);
    }


    /*
     * Register a new user.
     * @param identity_commitment The user's identity commitment, which is the
     *                            hash of their public key and their identity
     *                            nullifier (a random 31-byte value)
     */
    function insertIdentity(uint256 identity_commitment) public onlyOwner {
        insert(id_tree_index, identity_commitment);
        uint256 root = tree_roots[id_tree_index];
        root_history[root] = true;
    }

    /*
     * Change a user's identity commitment.
     * @param old_leaf The user's original identity commitment
     * @param leaf The user's new identity commitment
     * @param leaf_index The index of the original identity commitment in the tree
     * @param old_path The Merkle path to the original identity commitment
     * @param path The Merkle path to the new identity commitment
     */
    function updateIdentity(
        uint256 old_leaf,
        uint256 leaf,
        uint32 leaf_index,
        uint256[] memory old_path,
        uint256[] memory path
    ) public onlyOwner {
        update(id_tree_index, old_leaf, leaf, leaf_index, old_path, path);
        root_history[tree_roots[id_tree_index]] = true;
    }

    /*
     * @param n The nulllifier hash to check
     * @return True if the nullifier hash has previously been stored in the
     *         contract
     */
    function hasNullifier(uint n) public view returns (bool) {
        return nullifier_hash_history[n];
    }

    /*
     * @param The Merkle root to check
     * @return True if the root has previously been stored in the
     *         contract
     */
    function isInRootHistory(uint n) public view returns (bool) {
        return root_history[n];
    }

    /*
     * A convenience view function which helps operators to easily verify all
     * inputs to broadcastSignal() using a single contract call. This helps
     * them to save gas by detecting invalid inputs before they invoke
     * broadcastSignal(). Note that this function does the same checks as
     * `isValidSignalAndProof` but returns a bool instead of using require()
     * statements.
     */
    function preBroadcastCheck (
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input,
        uint256 signal_hash
    ) public view returns (bool) {
        return hasNullifier(input[1]) == false &&
            signal_hash == input[2] &&
            hasExternalNullifier(input[3]) &&
            isInRootHistory(input[0]) &&
            verifyProof(a, b, c, input);
    }

    /*
     * A modifier which ensures that the signal and proof are valid.
     * @param signal The signal to broadcast
     * @param a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param c The corresponding `c` parameter to verifier.sol's verifyProof()
     * @param input The public inputs to the zk-SNARK
     */
    modifier isValidSignalAndProof (
        bytes memory signal,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input
    ) {
        // Hash the signal
        uint256 signal_hash = uint256(keccak256(signal)) >> 8;

        require(hasNullifier(input[1]) == false, "Semaphore: nullifier already seen");
        require(signal_hash == input[2], "Semaphore: signal hash mismatch");
        require(hasExternalNullifier(input[3]), "Semaphore: external nullifier not found");
        require(isInRootHistory(input[0]), "Semaphore: root not seen");
        require(verifyProof(a, b, c, input), "Semaphore: invalid proof");
        _;
    }

    /*
     * Broadcast the signal.
     * @param signal The signal to broadcast
     * @param a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param c The corresponding `c` parameter to verifier.sol's verifyProof()
     * @param input The public inputs to the zk-SNARK
     */
    function broadcastSignal(
        bytes memory signal,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input // (root, nullifiers_hash, signal_hash, external_nullifier)
    ) public 
        onlyOwnerIfPermissioned
        isValidSignalAndProof(signal, a, b, c, input)
    {
        uint nullifiers_hash = input[1];

        signals[current_signal_index++] = signal;
        nullifier_hash_history[nullifiers_hash] = true;

        emit SignalBroadcast(signal, nullifiers_hash, input[3]);
    }

    /*
     * @param tree_index The tree in question
     * @return The Merkle root
     */
    function root(uint8 tree_index) public view returns (uint256) {
      return tree_roots[tree_index];
    }

    /*
     * @param tree_index The tree in question
     * @return The leaves of the tree
     */
    function leaves(uint8 tree_index) public view returns (uint256[] memory) {
      return tree_leaves[tree_index];
    }

    /*
     * @param tree_index The tree in question
     * @param leaf_index The index of the leaf to fetch
     * @return The leaf at leaf_index of the tree with index tree_index
     */
    function leaf(uint8 tree_index, uint256 leaf_index) public view returns (uint256) {
      return tree_leaves[tree_index][leaf_index];
    }

    /*
     * @return The index of the identity tree in MultipleMerkleTree
     */
    function getIdTreeIndex() public view returns (uint8) {
      return id_tree_index;
    }

    /*
     * Adds an external nullifier to the contract. Only the owner can do this.
     * @param new_external_nullifier The new external nullifier to set
     */
    function addExternalNullifier(uint256 _external_nullifier) public onlyOwner {
        // The external nullifier must not have already been set
        require(active_external_nullifiers[_external_nullifier] == false, "Semaphore: external nullifier already set");

        // Add a new external nullifier
        active_external_nullifiers[_external_nullifier] = true;
        external_nullifier_history[next_external_nullifier_history_index] = _external_nullifier;

        // Update the next index
        next_external_nullifier_history_index ++;
    }

    function removeExternalNullifier(uint256 _external_nullifier) public onlyOwner {
        // The external nullifier must have already been set
        require(active_external_nullifiers[_external_nullifier] == true, "Semaphore: external nullifier not found");

        // Remove the external nullifier
        active_external_nullifiers[_external_nullifier] = false;
    }

    /*
     * Returns the next external nullifier index.
     */
    function getNextExternalNullifierIndex() public view returns (uint256) {
        return next_external_nullifier_history_index;
    }

    /*
     * Returns the external nullifier at _index.
     * @param _index The index to use to look up the external_nullifier_history mapping
     */
    function getExternalNullifierByIndex(uint256 _index) public view returns (uint256) {
        return external_nullifier_history[_index];
    }

    /*
     * Returns true if and only if the specified external nullifier exists
     * @param _external_nullifier The specified external nullifier
     */
    function hasExternalNullifier(uint256 _external_nullifier) public view returns (bool) {
        return active_external_nullifiers[_external_nullifier];
    }

    /*
     * Sets the `is_broadcast_permissioned` storage variable, which determines
     * whether broadcastSignal can or cannot be called by only the contract
     * owner.
     */
    function setPermissioning(bool _newPermission) public onlyOwner {
      is_broadcast_permissioned = _newPermission;
    }
}
