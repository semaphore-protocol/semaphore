/*
 * Semaphore - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2020 Barry WhiteHat <barrywhitehat@protonmail.com>, Kobi
 * Gurkan <kobigurk@gmail.com> and Koh Wei Jie (contact@kohweijie.com)
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
    // user. An external nullifier can be active or deactivated.

    // Each node in the linked list
    struct ExternalNullifierNode {
        uint232 next;
        bool exists;
        bool isActive;
    }

    // We store the external nullifiers using a mapping of the form:
    // enA => { next external nullifier; if enA exists; if enA is active }
    // Think of it as a linked list.
    mapping (uint232 => ExternalNullifierNode) public
        externalNullifierLinkedList;

    uint256 public numExternalNullifiers = 0;
    
    // First and last external nullifiers for linked list enumeration
    uint232 public firstExternalNullifier = 0;
    uint232 public lastExternalNullifier = 0;

    // Whether broadcastSignal() can only be called by the owner of this
    // contract. This is the case as a safe default.
    bool public isBroadcastPermissioned = true;

    // Whether the contract has already seen a particular nullifier hash
    mapping (uint256 => bool) public nullifierHashHistory;

    event PermissionSet(bool indexed newPermission);
    event ExternalNullifierAdd(uint232 indexed externalNullifier);
    event ExternalNullifierChangeStatus(
        uint232 indexed externalNullifier,
        bool indexed active
    );

    // This value should be equal to
    // 0x7d10c03d1f7884c85edee6353bd2b2ffbae9221236edde3778eac58089912bc0
    // which you can calculate using the following ethersjs code:
    // ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')])
    // By setting the value of unset (empty) tree leaves to this
    // nothing-up-my-sleeve value, the authors hope to demonstrate that they do
    // not have its preimage and therefore cannot spend funds they do not own.

    uint256 public NOTHING_UP_MY_SLEEVE_ZERO = 
        uint256(keccak256(abi.encodePacked('Semaphore'))) % SNARK_SCALAR_FIELD;

    /*
     * If broadcastSignal is permissioned, check if msg.sender is the contract
     * owner
     */
    modifier onlyOwnerIfPermissioned() {
        require(
            !isBroadcastPermissioned || isOwner(),
            "Semaphore: broadcast permission denied"
        );

        _;
    }

    /*
     * @param _treeLevels The depth of the identity tree.
     * @param _firstExternalNullifier The first identity nullifier to add.
     */
    constructor(uint8 _treeLevels, uint232 _firstExternalNullifier)
        IncrementalMerkleTree(_treeLevels, NOTHING_UP_MY_SLEEVE_ZERO)
        Ownable()
        public {
            addEn(_firstExternalNullifier, true);
    }

    /*
     * Registers a new user. 
     * @param _identity_commitment The user's identity commitment, which is the
     *                            hash of their public key and their identity
     *                            nullifier (a random 31-byte value). It should
     *                            be the output of a Pedersen hash. It is the
     *                            responsibility of the caller to verify this.
     */
    function insertIdentity(uint256 _identityCommitment) public onlyOwner
    returns (uint256) {
        // Ensure that the given identity commitment is not the zero value
        require(
            _identityCommitment != NOTHING_UP_MY_SLEEVE_ZERO,
            "Semaphore: identity commitment cannot be the nothing-up-my-sleeve-value"
        );

        return insertLeaf(_identityCommitment);
    }

    /*
     * Checks if all values within pi_a, pi_b, and pi_c of a zk-SNARK are less
     * than the scalar field.
     * @param _a The corresponding `a` parameter to verifier.sol's
     *           verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's
     *           verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's
                 verifyProof()
     */
    function areAllValidFieldElements(
        uint256[8] memory _proof
    ) internal pure returns (bool) {
        return 
            _proof[0] < SNARK_SCALAR_FIELD &&
            _proof[1] < SNARK_SCALAR_FIELD &&
            _proof[2] < SNARK_SCALAR_FIELD &&
            _proof[3] < SNARK_SCALAR_FIELD &&
            _proof[4] < SNARK_SCALAR_FIELD &&
            _proof[5] < SNARK_SCALAR_FIELD &&
            _proof[6] < SNARK_SCALAR_FIELD &&
            _proof[7] < SNARK_SCALAR_FIELD;
    }

    /*
     * Produces a keccak256 hash of the given signal, shifted right by 8 bits.
     * @param _signal The signal to hash
     */
    function hashSignal(bytes memory _signal) internal pure returns (uint256) {
        return uint256(keccak256(_signal)) >> 8;
    }

    /*
     * A convenience function which returns a uint256 array of 8 elements which
     * comprise a Groth16 zk-SNARK proof's pi_a, pi_b, and pi_c  values.
     * @param _a The corresponding `a` parameter to verifier.sol's
     *           verifyProof()
     * @param _b The corresponding `b` parameter to verifier.sol's
     *           verifyProof()
     * @param _c The corresponding `c` parameter to verifier.sol's
     *           verifyProof()
     */
    function packProof (
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c
    ) public pure returns (uint256[8] memory) {

        return [
            _a[0],
            _a[1], 
            _b[0][0],
            _b[0][1],
            _b[1][0],
            _b[1][1],
            _c[0],
            _c[1]
        ];
    }

    /*
     * A convenience function which converts an array of 8 elements, generated
     * by packProof(), into a format which verifier.sol's verifyProof()
     * accepts.
     * @param _proof The proof elements.
     */
    function unpackProof(
        uint256[8] memory _proof
    ) public pure returns (
        uint256[2] memory,
        uint256[2][2] memory,
        uint256[2] memory
    ) {

        return (
            [_proof[0], _proof[1]],
            [
                [_proof[2], _proof[3]],
                [_proof[4], _proof[5]]
            ],
            [_proof[6], _proof[7]]
        );
    }


    /*
     * A convenience view function which helps operators to easily verify all
     * inputs to broadcastSignal() using a single contract call. This helps
     * them to save gas by detecting invalid inputs before they invoke
     * broadcastSignal(). Note that this function does the same checks as
     * `isValidSignalAndProof` but returns a bool instead of using require()
     * statements.
     * @param _signal The signal to broadcast
     * @param _proof The proof elements.
     * @param _root The Merkle tree root
     * @param _nullifiersHash The nullifiers hash
     * @param _signalHash The signal hash. This is included so as to verify in
     *                    Solidity that the signal hash computed off-chain
     *                    matches.
     * @param _externalNullifier The external nullifier
     */
    function preBroadcastCheck (
        bytes memory _signal,
        uint256[8] memory _proof,
        uint256 _root,
        uint256 _nullifiersHash,
        uint256 _signalHash,
        uint232 _externalNullifier
    ) public view returns (bool) {

        uint256[4] memory publicSignals =
            [_root, _nullifiersHash, _signalHash, _externalNullifier];

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = 
            unpackProof(_proof);

        return nullifierHashHistory[_nullifiersHash] == false &&
            hashSignal(_signal) == _signalHash &&
            _signalHash == hashSignal(_signal) &&
            isExternalNullifierActive(_externalNullifier) &&
            rootHistory[_root] &&
            areAllValidFieldElements(_proof) &&
            _root < SNARK_SCALAR_FIELD &&
            _nullifiersHash < SNARK_SCALAR_FIELD &&
            verifyProof(a, b, c, publicSignals);
    }

    /*
     * A modifier which ensures that the signal and proof are valid.
     * @param _signal The signal to broadcast
     * @param _proof The proof elements.
     * @param _root The Merkle tree root
     * @param _nullifiersHash The nullifiers hash
     * @param _signalHash The signal hash
     * @param _externalNullifier The external nullifier
     */
    modifier isValidSignalAndProof (
        bytes memory _signal,
        uint256[8] memory _proof,
        uint256 _root,
        uint256 _nullifiersHash,
        uint232 _externalNullifier
    ) {
        // Check whether each element in _proof is a valid field element. Even
        // if verifier.sol does this check too, it is good to do so here for
        // the sake of good protocol design.
        require(
            areAllValidFieldElements(_proof),
            "Semaphore: invalid field element(s) in proof"
        );

        // Check whether the nullifier hash has been seen
        require(
            nullifierHashHistory[_nullifiersHash] == false,
            "Semaphore: nullifier already seen"
        );

        // Check whether the nullifier hash is active
        require(
            isExternalNullifierActive(_externalNullifier),
            "Semaphore: external nullifier not found"
        );

        // Check whether the given Merkle root has been seen previously
        require(rootHistory[_root], "Semaphore: root not seen");

        uint256 signalHash = hashSignal(_signal);

        // Check whether _nullifiersHash is a valid field element.
        require(
            _nullifiersHash < SNARK_SCALAR_FIELD,
            "Semaphore: the nullifiers hash must be lt the snark scalar field"
        );

        uint256[4] memory publicSignals =
            [_root, _nullifiersHash, signalHash, _externalNullifier];

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) =
            unpackProof(_proof);

        require(
            verifyProof(a, b, c, publicSignals),
            "Semaphore: invalid proof"
        );

        // Note that we don't need to check if signalHash is less than
        // SNARK_SCALAR_FIELD because it always holds true due to the
        // definition of hashSignal()

        _;
    }

    /*
     * Broadcasts the signal.
     * @param _signal The signal to broadcast
     * @param _proof The proof elements.
     * @param _root The root of the Merkle tree (the 1st public signal)
     * @param _nullifiersHash The nullifiers hash (the 2nd public signal)
     * @param _externalNullifier The nullifiers hash (the 4th public signal)
     */
    function broadcastSignal(
        bytes memory _signal,
        uint256[8] memory _proof,
        uint256 _root,
        uint256 _nullifiersHash,
        uint232 _externalNullifier
    ) public 
        onlyOwnerIfPermissioned
        isValidSignalAndProof(
            _signal, _proof, _root, _nullifiersHash, _externalNullifier
        )
    {
        // Client contracts should be responsible for storing the signal and/or
        // emitting it as an event 

        // Store the nullifiers hash to prevent double-signalling
        nullifierHashHistory[_nullifiersHash] = true;
    }

    /*
     * A private helper function which adds an external nullifier.
     * @param _externalNullifier The external nullifier to add.
     * @param _isFirst Whether _externalNullifier is the first external
     * nullifier. Only the constructor should set _isFirst to true when it
     * calls addEn().
     */
    function addEn(uint232 _externalNullifier, bool isFirst) private {
        if (isFirst) {
            firstExternalNullifier = _externalNullifier;
        } else {
            // The external nullifier must not have already been set
            require(
                externalNullifierLinkedList[_externalNullifier].exists == false,
                "Semaphore: external nullifier already set"
            );

            // Connect the previously added external nullifier node to this one
            externalNullifierLinkedList[lastExternalNullifier].next =
                _externalNullifier;
        }

        // Add a new external nullifier
        externalNullifierLinkedList[_externalNullifier].next = 0;
        externalNullifierLinkedList[_externalNullifier].isActive = true;
        externalNullifierLinkedList[_externalNullifier].exists = true;

        // Set the last external nullifier to this one
        lastExternalNullifier = _externalNullifier;

        numExternalNullifiers ++;

        emit ExternalNullifierAdd(_externalNullifier);
    }

    /*
     * Adds an external nullifier to the contract. Only the owner can do this.
     * This external nullifier is active once it is added.
     * @param new_externalNullifier The new external nullifier to set.
     */
    function addExternalNullifier(uint232 _externalNullifier) public
    onlyOwner {
        addEn(_externalNullifier, false);
    }

    /*
     * Deactivate an external nullifier. The external nullifier must already be
     * active for this function to work. Only the owner can do this.
     * @param new_externalNullifier The new external nullifier to deactivate.
     */
    function deactivateExternalNullifier(uint232 _externalNullifier) public
    onlyOwner {
        // The external nullifier must already exist
        require(
            externalNullifierLinkedList[_externalNullifier].exists,
            "Semaphore: external nullifier not found"
        );

        // The external nullifier must already be active
        require(
            externalNullifierLinkedList[_externalNullifier].isActive == true,
            "Semaphore: external nullifier already deactivated"
        );

        // Deactivate the external nullifier. Note that we don't change the
        // value of nextEn.
        externalNullifierLinkedList[_externalNullifier].isActive = false;

        emit ExternalNullifierChangeStatus(_externalNullifier, false);
    }

    /*
     * Reactivate an external nullifier. The external nullifier must already be
     * inactive for this function to work. Only the owner can do this.
     * @param new_externalNullifier The new external nullifier to reactivate.
     */
    function reactivateExternalNullifier(uint232 _externalNullifier) public
    onlyOwner {
        // The external nullifier must already exist
        require(
            externalNullifierLinkedList[_externalNullifier].exists,
            "Semaphore: external nullifier not found"
        );

        // The external nullifier must already have been deactivated
        require(
            externalNullifierLinkedList[_externalNullifier].isActive == false,
            "Semaphore: external nullifier is already active"
        );

        // Reactivate the external nullifier
        externalNullifierLinkedList[_externalNullifier].isActive = true;

        emit ExternalNullifierChangeStatus(_externalNullifier, true);
    }

    /*
     * Returns true if and only if the specified external nullifier is active
     * @param _externalNullifier The specified external nullifier.
     */
    function isExternalNullifierActive(uint232 _externalNullifier) public view
    returns (bool) {
        return externalNullifierLinkedList[_externalNullifier].isActive;
    }

    /*
     * Returns the next external nullifier after the specified external
     * nullifier in the linked list.
     * @param _externalNullifier The specified external nullifier.
     */
    function getNextExternalNullifier(uint232 _externalNullifier) public view
    returns (uint232) {

        require(
            externalNullifierLinkedList[_externalNullifier].exists,
            "Semaphore: no such external nullifier"
        );

        uint232 n = externalNullifierLinkedList[_externalNullifier].next;

        require(
            numExternalNullifiers > 1 && externalNullifierLinkedList[n].exists,
            "Semaphore: no external nullifier exists after the specified one"
        );
        
        return n;
    }

    /*
     * Returns the number of inserted identity commitments.
     */
    function getNumIdentityCommitments() public view returns (uint256) {
        return nextLeafIndex;
    }

    /*
     * Sets the `isBroadcastPermissioned` storage variable, which determines
     * whether broadcastSignal can or cannot be called by only the contract
     * owner.
     * @param _newPermission True if the broadcastSignal can only be called by
     *                       the contract owner; and False otherwise.
     */
    function setPermissioning(bool _newPermission) public onlyOwner {

      isBroadcastPermissioned = _newPermission;

      emit PermissionSet(_newPermission);
    }
}
