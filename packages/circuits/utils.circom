pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template CalculateAnonymousIdentity() {
    signal input identityNullifier;
    signal input identityTrapdoor;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== identityNullifier;
    poseidon.inputs[1] <== identityTrapdoor;

    out <== poseidon.out;
}

template CalculateRoleCommitment() {
    signal input anonymousIdentity;
    signal input role;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== anonymousIdentity;
    poseidon.inputs[1] <== role;

    out <== poseidon.out;
}

template CalculateNullifierHash() {
    signal input identityNullifier;

    signal output out;

    component poseidon = Poseidon(1);

    poseidon.inputs[0] <== identityNullifier;

    out <== poseidon.out;
}

template CalculateNullifierHashWithExternalNullifier() {
    signal input externalNullifier;
    signal input identityNullifier;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== externalNullifier;
    poseidon.inputs[1] <== identityNullifier;

    out <== poseidon.out;
}