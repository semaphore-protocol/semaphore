pragma circom 2.0.0;

include "./tree.circom";
include "./count.circom";
include "./utils.circom";

template Register(nLevels, N) {
    signal input identityNullifier;
    signal input identityTrapdoor;
    signal input role;
    signal input candidates[N];

    signal output roleCommitment;
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

    roleCommitment <== calculateRoleCommitment.out;

    // calculate nullifier 
    component calculateNullifierHash = CalculateNullifierHash();
    calculateNullifierHash.identityNullifier <== identityNullifier;

    nullifierHash <== calculateNullifierHash.out;

    // assertion of role
    component count = Count(N);
    count.role <== role;
    for (var i=0;i<N;i++) {
        count.candidates[i] <== candidates[i];
    }
    count.out === 1;
}

component main {public [candidates]} = Register(20, 5);