pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./manyMerkleProof.circom";

template CalculateSecret() {
    signal input identityNullifier;
    signal input identityTrapdoor;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== identityNullifier;
    poseidon.inputs[1] <== identityTrapdoor;

    out <== poseidon.out;
}

template CalculateIdentityCommitment() {
    signal input secret;

    signal output out;

    component poseidon = Poseidon(1);

    poseidon.inputs[0] <== secret;

    out <== poseidon.out;
}

template CalculateNullifierHash() {
    signal input externalNullifier;
    signal input identityNullifier;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== externalNullifier;
    poseidon.inputs[1] <== identityNullifier;

    out <== poseidon.out;
}

// nLevels must be < 32.
template Semaphore(nLevels, length) {
    signal input identityNullifier;
    signal input identityTrapdoor;
    signal input treePathIndices[nLevels];
    signal input treeSiblings[nLevels];

    signal input signalHash;
    signal input externalNullifier;

    // roots for interoperability, one-of-many merkle membership proof
    signal input roots[length];
    signal input chainID;

    signal output nullifierHash;

    component calculateSecret = CalculateSecret();
    calculateSecret.identityNullifier <== identityNullifier;
    calculateSecret.identityTrapdoor <== identityTrapdoor;

    signal secret;
    secret <== calculateSecret.out;

    component calculateIdentityCommitment = CalculateIdentityCommitment();
    calculateIdentityCommitment.secret <== secret;

    component calculateNullifierHash = CalculateNullifierHash();
    calculateNullifierHash.externalNullifier <== externalNullifier;
    calculateNullifierHash.identityNullifier <== identityNullifier;

//

    component inclusionProof = ManyMerkleProof(nLevels, length);
    inclusionProof.leaf <== calculateIdentityCommitment.out;
    // transformed value into list of values due to semaphore usage
    /* inclusionProof.pathIndices <== inPathIndices[tx]; */

    // add the roots and diffs signals to the bridge circuit
    for (var i = 0; i < length; i++) {
        inclusionProof.roots[i] <== roots[i];
    }

    for (var i = 0; i < nLevels; i++) {
        inclusionProof.pathElements[i] <== treeSiblings[i];
        inclusionProof.pathIndices[i] <== treePathIndices[i];
    }

    // Dummy square to prevent tampering signalHash.
    signal signalHashSquared;
    signalHashSquared <== signalHash * signalHash;

    // Dummy square to prevent tampering chainID.
    signal chainIDSquared;
    chainIDSquared <== chainID * chainID;

    nullifierHash <== calculateNullifierHash.out;
}
