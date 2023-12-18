pragma circom 2.1.5;

include "babyjub.circom";
include "poseidon.circom";
include "binary-merkle-root.circom";

template Semaphore(MAX_DEPTH) {
    signal input privateKey;
    signal input treeDepth, treeIndices[MAX_DEPTH], treeSiblings[MAX_DEPTH];
    signal input message;
    signal input scope;

    signal output treeRoot, nullifier;

    var Ax, Ay;
    (Ax, Ay) = BabyPbk()(privateKey);

    var identityCommitment = Poseidon(2)([Ax, Ay]);

    treeRoot <== BinaryMerkleRoot(MAX_DEPTH)(identityCommitment, treeDepth, treeIndices, treeSiblings);
    nullifier <== Poseidon(2)([scope, privateKey]);

    // Dummy constraint to prevent compiler from optimizing it.
    signal dummySquare <== message * message;
}
