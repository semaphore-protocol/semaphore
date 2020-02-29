/*
 * Semaphore - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of Semaphore.
 *
 * Semaphore is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Semaphore is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Semaphore.  If not, see <http://www.gnu.org/licenses/>.
 */

pragma solidity ^0.5.0;

import "./verifier.sol";
import { IncrementalMerkleTree } from "./IncrementalMerkleTree.sol";
import "./Ownable.sol";

contract Semaphore is Verifier, IncrementalMerkleTree, Ownable {
    // The external nullifier helps to prevent double-signalling by the same
    // user. The activeExternalNullifiers mapping allows for quick lookups of
    // whether an external nullifier is active, and the
    // externalNullifierHistory allows for easy enumeration of all external
    // nullifiers.

    // Note that externalNullifierHistory(index) IS NOT the source of truth
    // about whether an external nullifier is active, as
    // deactivateExternalNullifier() only sets the boolean of the
    // activeExternalNullifiers mapping to false, and doesn't touch
    // externalNullifierHistory.
    mapping (uint256 => bool) activeExternalNullifiers;
    mapping (uint256 => uint256) externalNullifierHistory;
    uint256 private nextExternalNullifierHistoryIndex;

    // Whether broadcastSignal() can only be called by the owner of this
    // contract. This is the case as a safe default.
    bool public isBroadcastPermissioned = true;

    // The scalar field
    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    // Whether the contract has already seen a particular Merkle tree root
    mapping (uint256 => bool) rootHistory;

    // Whether the contract has already seen a particular nullifier hash
    mapping (uint256 => bool) public nullifierHashHistory;

    event SignalBroadcast(uint256 indexed externalNullifier);
    event ExternalNullifierAdd(uint256 indexed externalNullifier);
    event ExternalNullifierDeactivate(uint256 indexed externalNullifier);
    event ExternalNullifierReactivate(uint256 indexed externalNullifier);

    // This value should be equal to
    // 0x7d10c03d1f7884c85edee6353bd2b2ffbae9221236edde3778eac58089912bc0
    // ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')])
    // By setting the value of unset tree leaves to this nothing-up-my-sleeve
    // value, the authors hope to demonstrate that they do not have its
    // preimage and therefore cannot spend funds they do not own.

    uint256 public NOTHING_UP_MY_SLEEVE_ZERO = uint256(keccak256(abi.encodePacked('Semaphore')));

    /*
     * If broadcastSignal is permissioned, check if msg.sender is the contract owner
     */
    modifier onlyOwnerIfPermissioned() {
        require(!isBroadcastPermissioned || isOwner(), "Semaphore: broadcast permission denied");
        _;
    }

    constructor(uint8 _treeLevels, uint256 _firstExternalNullifier) Ownable() public {
        addExternalNullifier(_firstExternalNullifier);
        // We hardcode the zero value as the keccak256 hash of 0, and in
        // insertIdentity(), prevent anyone from inserting that value as an
        // identity commitment.
        initMerkleTree(_treeLevels, NOTHING_UP_MY_SLEEVE_ZERO);
    }

    /*
     * Register a new user. _identityCommitment should be the output of a 
     * Pedersen hash. It's the responsibilty of the caller to verify that.
     * @param identity_commitment The user's identity commitment, which is the
     *                            hash of their public key and their identity
     *                            nullifier (a random 31-byte value)
     */
    function insertIdentity(uint256 _identityCommitment) public onlyOwner {
        // Ensure that the given identity commitment is not the zero value
        require(_identityCommitment != NOTHING_UP_MY_SLEEVE_ZERO, "Semaphore: identity commitment cannot be keccak256(0)");

        insertLeaf(_identityCommitment);
        rootHistory[getTreeRoot()] = true;
    }

    /*
     * Checks if all values within pi_a, pi_b, and pi_c of a zk-SNARK are less
     * than the scalar field.
     * @param _a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's verifyProof()
     */
    function areAllValidFieldElements(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c
    ) public pure returns (bool) {
        return 
            _a[0] < SNARK_SCALAR_FIELD &&
            _a[1] < SNARK_SCALAR_FIELD &&
            _b[0][0] < SNARK_SCALAR_FIELD &&
            _b[0][1] < SNARK_SCALAR_FIELD &&
            _b[1][0] < SNARK_SCALAR_FIELD &&
            _b[1][1] < SNARK_SCALAR_FIELD &&
            _c[0] < SNARK_SCALAR_FIELD &&
            _c[1] < SNARK_SCALAR_FIELD;
    }

    /*
     * Produce a keccak256 hash of the given signal.
     * @param _signal The signal to hash
     */
    function hashSignal(bytes memory _signal) public pure returns (uint256) {
        return uint256(keccak256(_signal)) >> 8;
    }

    /*
     * A convenience view function which helps operators to easily verify all
     * inputs to broadcastSignal() using a single contract call. This helps
     * them to save gas by detecting invalid inputs before they invoke
     * broadcastSignal(). Note that this function does the same checks as
     * `isValidSignalAndProof` but returns a bool instead of using require()
     * statements.
     * @param _signal The signal to broadcast
     * @param _a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's verifyProof()
     * @param _root The Merkle tree root
     * @param _nullifiersHash The nullifiers hash
     * @param _signalHash The signal hash. This is included so as to verify in
     *                    Solidity that the signal hash computed off-chain
     *                    matches.
     * @param _externalNullifier The external nullifier
     */
    function preBroadcastCheck (
        bytes memory _signal,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint256 _root,
        uint256 _nullifiersHash,
        uint256 _signalHash,
        uint256 _externalNullifier
    ) public view returns (bool) {
        uint256[4] memory publicSignals = [_root, _nullifiersHash, _signalHash, _externalNullifier];

        return nullifierHashHistory[_nullifiersHash] == false &&
            _signalHash == hashSignal(_signal) &&
            isExternalNullifierActive(_externalNullifier) &&
            rootHistory[_root] &&
            verifyProof(_a, _b, _c, publicSignals);
    }

    /*
     * A modifier which ensures that the signal and proof are valid.
     * @param _signal The signal to broadcast
     * @param _a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's verifyProof()
     * @param _root The Merkle tree root
     * @param _nullifiersHash The nullifiers hash
     * @param _signalHash The signal hash
     * @param _externalNullifier The external nullifier
     */
    modifier isValidSignalAndProof (
        bytes memory _signal,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256 _root,
        uint256 _nullifiersHash,
        uint256 _externalNullifier
    ) {
        // Check whether _a, _b, _and _c are valid field elements here.
        // Even if verifier.sol does this check too, it is good to do so here
        // for the sake of good protocol design.
        require(areAllValidFieldElements(_a, _b, _c), "Semaphore: invalid field element(s) in proof");

        // Check whether the nullifier hash has been seen
        require(nullifierHashHistory[_nullifiersHash] == false, "Semaphore: nullifier already seen");

        // Check whether the nullifier hash is active
        require(isExternalNullifierActive(_externalNullifier), "Semaphore: external nullifier not found");

        // Check whether the given Merkle root has been seen previously
        require(rootHistory[_root], "Semaphore: root not seen");

        uint256 signalHash = hashSignal(_signal);

        // Check whether _root, _nullifiersHash, and _externalNullifier are valid field elements.
        require(_root < SNARK_SCALAR_FIELD, "Semaphore: the root must be lt the snark scalar field");
        require(_nullifiersHash < SNARK_SCALAR_FIELD, "Semaphore: the nullifiers hash must be lt the snark scalar field");
        require(signalHash < SNARK_SCALAR_FIELD, "Semaphore: the signal hash must be lt the snark scalar field");
        require(_externalNullifier < SNARK_SCALAR_FIELD, "Semaphore: the external nullifier must be lt the snark scalar field");

        uint256[4] memory publicSignals = [_root, _nullifiersHash, signalHash, _externalNullifier];
        require(verifyProof(_a, _b, _c, publicSignals), "Semaphore: invalid proof");

        _;
    }

    /*
     * Broadcast the signal.
     * @param _signal The signal to broadcast
     * @param _a The corresponding `a` parameter to verifier.sol's verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's verifyProof()
     * @param _root The root of the Merkle tree (the 1st public signal)
     * @param _nullifiersHash The nullifiers hash (the 2nd public signal)
     * @param _externalNullifier The nullifiers hash (the 4th public signal)
     */
    function broadcastSignal(
        bytes memory _signal,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256 _root,
        uint256 _nullifiersHash,
        uint256 _externalNullifier
    ) public 
        onlyOwnerIfPermissioned
        isValidSignalAndProof(_signal, _a, _b, _c, _root, _nullifiersHash, _externalNullifier)
    {
        // Client contracts should be responsible for storing the signal and/or
        // emitting it as an event 

        // Store the nullifiers hash to prevent double-signalling
        nullifierHashHistory[_nullifiersHash] = true;

        emit SignalBroadcast(_externalNullifier);
    }

    /*
     * Adds an external nullifier to the contract. Only the owner can do this.
     * @param new_externalNullifier The new external nullifier to set
     */
    function addExternalNullifier(uint256 _externalNullifier) public onlyOwner {
        // The external nullifier must not have already been set
        require(activeExternalNullifiers[_externalNullifier] == false, "Semaphore: external nullifier already set");

        // The external nullifier should be < 2 ** 232 (29 bytes)
        require(_externalNullifier < 2 ** 232, "Semaphore: external nullifier too large");

        // Add a new external nullifier
        activeExternalNullifiers[_externalNullifier] = true;
        externalNullifierHistory[nextExternalNullifierHistoryIndex] = _externalNullifier;

        // Update the next index
        nextExternalNullifierHistoryIndex ++;

        emit ExternalNullifierAdd(_externalNullifier);
    }

    function deactivateExternalNullifier(uint256 _externalNullifier) public onlyOwner {
        // The external nullifier must have already been set
        require(activeExternalNullifiers[_externalNullifier] == true, "Semaphore: external nullifier not found");

        // Deactivate the external nullifier
        activeExternalNullifiers[_externalNullifier] = false;

        emit ExternalNullifierDeactivate(_externalNullifier);
    }

    function reactivateExternalNullifier(uint256 _externalNullifierIndex) public onlyOwner {
        // Ensures that the index is within range
        require(_externalNullifierIndex < nextExternalNullifierHistoryIndex, "Semaphore: specified index is too large");

        uint256 externalNullifier = externalNullifierHistory[_externalNullifierIndex];

        // Check if the external nullifier is inactive as it should
        require(activeExternalNullifiers[externalNullifier] == false, "Semaphore: external nullifier is already active");

        // Reactivate the external nullifier
        activeExternalNullifiers[externalNullifier] = true;

        emit ExternalNullifierReactivate(externalNullifier);
    }

    /*
     * Returns the next external nullifier index.
     */
    function getNextExternalNullifierIndex() public view returns (uint256) {
        return nextExternalNullifierHistoryIndex;
    }

    /*
     * Returns the external nullifier at _index.
     * @param _index The index to use to look up the externalNullifierHistory mapping
     */
    function getExternalNullifierByIndex(uint256 _index) public view returns (uint256) {
        return externalNullifierHistory[_index];
    }

    /*
     * Returns true if and only if the specified external nullifier is active
     * @param _externalNullifier The specified external nullifier
     */
    function isExternalNullifierActive(uint256 _externalNullifier) public view returns (bool) {
        return activeExternalNullifiers[_externalNullifier];
    }

    /*
     * Returns the number of inserted identity commitments.
     */
    function getNumIdentityCommitments() public view returns (uint32) {
        return nextLeafIndex;
    }

    /*
     * Sets the `isBroadcastPermissioned` storage variable, which determines
     * whether broadcastSignal can or cannot be called by only the contract
     * owner.
     */
    function setPermissioning(bool _newPermission) public onlyOwner {
      isBroadcastPermissioned = _newPermission;
    }
}
