pragma circom 2.0.0;

include "./tree.circom";
include "./count.circom";
include "./utils.circom";

template Register(nLevels, N) {
    signal input identityNullifier;
    signal input identityTrapdoor;
    signal input externalNullifier;
    signal input signalHash;

    signal input treePathIndices[nLevels];
    signal input treeSiblings[nLevels];
    signal input role;
    signal input candidates[N];

    signal output root;
    signal output count;
    signal output nullifierHash;

    // calculate anonymousIdentity
    component calculateAnonymousIdentity = CalculateAnonymousIdentity();
    calculateAnonymousIdentity.identityNullifier <== identityNullifier;
    calculateAnonymousIdentity.identityTrapdoor <== identityTrapdoor;

    signal anonymousIdentity;
    anonymousIdentity <== calculateAnonymousIdentity.out;

    // calculate role commitment 
    component calculateRoleCommitment = CalculateRoleCommitment();
    calculateRoleCommitment.anonymousIdentity <== anonymousIdentity;
    calculateRoleCommitment.role <== role;

    signal roleCommitment;
    roleCommitment <== calculateRoleCommitment.out;

    // calculate nullifier 
    component calculateNullifierHashEN = CalculateNullifierHashWithExternalNullifier();
    calculateNullifierHashEN.identityNullifier <== identityNullifier;
    calculateNullifierHashEN.externalNullifier <== externalNullifier;

    nullifierHash <== calculateNullifierHashEN.out;

    // count of role
    component cnt = Count(N);
    cnt.role <== role;
    for (var i=0;i<N;i++) {
        cnt.candidates[i] <== candidates[i];
    }
    cnt.out ==> count;

    // inclusion proof
    component inclusionProof = MerkleTreeInclusionProof(nLevels);
    inclusionProof.leaf <== roleCommitment;

    for (var i = 0; i < nLevels; i++) {
        inclusionProof.siblings[i] <== treeSiblings[i];
        inclusionProof.pathIndices[i] <== treePathIndices[i];
    }

    root <== inclusionProof.root;

    // Dummy square to prevent tampering signalHash.
    signal signalHashSquared;
    signalHashSquared <== signalHash * signalHash;
}

component main {public [candidates, externalNullifier, signalHash]} = Register(20, 5);