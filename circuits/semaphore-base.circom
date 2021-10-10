include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/babyjub.circom";
include "./tree.circom";


template CalculateSecret() {
    signal input identity_nullifier;
    signal input identity_trapdoor;

    signal output out;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== identity_nullifier;
    hasher.inputs[1] <== identity_trapdoor;
    out <== hasher.out;
}

template CalculateIdentityCommitment() {
    signal input secret_hash;

    signal output out;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret_hash;
    out <== hasher.out;
}

template CalculateNullifierHash() {
    signal input external_nullifier;
    signal input identity_nullifier;
    signal input n_levels;

    signal output out;

    component hasher = Poseidon(3);
    hasher.inputs[0] <== external_nullifier;
    hasher.inputs[1] <== identity_nullifier;
    hasher.inputs[2] <== n_levels;
    out <== hasher.out;
}

// n_levels must be < 32
template Semaphore(n_levels) {

    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    signal input signal_hash;
    signal input external_nullifier;

    signal private input identity_nullifier;
    signal private input identity_trapdoor;
    signal private input identity_path_index[n_levels];
    signal private input path_elements[n_levels][LEAVES_PER_PATH_LEVEL];

    signal output root;
    signal output nullifierHash;

    component secret = CalculateSecret();
    secret.identity_nullifier <== identity_nullifier;
    secret.identity_trapdoor <== identity_trapdoor;

    signal secret_hash;
    secret_hash <== secret.out;

    component identity_commitment = CalculateIdentityCommitment();
    identity_commitment.secret_hash <== secret_hash;

    component calculateNullifierHash = CalculateNullifierHash();
    calculateNullifierHash.external_nullifier <== external_nullifier;
    calculateNullifierHash.identity_nullifier <== identity_nullifier;
    calculateNullifierHash.n_levels <== n_levels;

    var i;
    var j;
    component inclusionProof = QuinTreeInclusionProof(n_levels);
    inclusionProof.leaf <== identity_commitment.out;

    for (i = 0; i < n_levels; i++) {
      for (j = 0; j < LEAVES_PER_PATH_LEVEL; j++) {
        inclusionProof.path_elements[i][j] <== path_elements[i][j];
      }
      inclusionProof.path_index[i] <== identity_path_index[i];
    }

    root <== inclusionProof.root;

    // Dummy square to prevent tampering signalHash
    signal signal_hash_squared;
    signal_hash_squared <== signal_hash * signal_hash;

    nullifierHash <== calculateNullifierHash.out;
}
