pragma circom 2.1.5;

include "babyjub.circom";
include "poseidon.circom";
include "binary-merkle-root.circom";

template Semaphore(MAX_DEPTH) {
    signal input secret;
    signal input merkleProofLength, merkleProofIndices[MAX_DEPTH], merkleProofSiblings[MAX_DEPTH];
    signal input message;
    signal input scope;

    signal output merkleRoot, nullifier;

    var Ax, Ay;
    (Ax, Ay) = BabyPbk()(secret);

    var identityCommitment = Poseidon(2)([Ax, Ay]);

    merkleRoot <== BinaryMerkleRoot(MAX_DEPTH)(identityCommitment, merkleProofLength, merkleProofIndices, merkleProofSiblings);
    nullifier <== Poseidon(2)([scope, secret]);

    // Dummy constraint to prevent compiler from optimizing it.
    signal dummySquare <== message * message;
}
