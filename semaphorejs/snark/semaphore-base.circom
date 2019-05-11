include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/eddsamimc.circom";

template HashLeftRight(n_rounds) {
  signal input left;
  signal input right;

  signal output hash;

  component hasher = MultiMiMC7(2, n_rounds);
  left ==> hasher.in[0];
  right ==> hasher.in[1];
  hasher.k <== 0;

  hash <== hasher.out;
}

template Selector() {
  signal input input_elem;
  signal input path_elem;
  signal input path_index;

  signal output left;
  signal output right;

  signal left_selector_1;
  signal left_selector_2;
  signal right_selector_1;
  signal right_selector_2;

  path_index * (1-path_index) === 0

  left_selector_1 <== (1 - path_index)*input_elem;
  left_selector_2 <== (path_index)*path_elem;
  right_selector_1 <== (path_index)*input_elem;
  right_selector_2 <== (1 - path_index)*path_elem;

  left <== left_selector_1 + left_selector_2;
  right <== right_selector_1 + right_selector_2;
}

template Semaphore(jubjub_field_size, n_levels, n_rounds) {
    // BEGIN signals

    signal input signal_hash;
    signal input external_nullifier;
    signal input broadcaster_address;

    // mimc vector commitment
    signal private input identity_pk[2];
    signal private input identity_nullifier;
    signal private input identity_r;
    signal private input identity_path_elements[n_levels];
    signal private input identity_path_index[n_levels];

    // signature on (external nullifier, signal_hash) with identity_pk
    signal private input auth_sig_r[2];
    signal private input auth_sig_s;

    // mimc hash
    signal output root;
    signal output nullifiers_hash;

    // END signals

    component identity_commitment = MultiMiMC7(4, n_rounds);

    // BEGIN identity commitment
    identity_commitment.in[0] <== identity_pk[0];
    identity_commitment.in[1] <== identity_pk[1];
    identity_commitment.in[2] <== identity_nullifier;
    identity_commitment.in[3] <== identity_r;
    identity_commitment.k <== 0;
    // END identity commitment

    // BEGIN tree
    component selectors[n_levels];
    component hashers[n_levels];

    for (var i = 0; i < n_levels; i++) {
      selectors[i] = Selector();
      hashers[i] = HashLeftRight(n_rounds);

      identity_path_index[i] ==> selectors[i].path_index;
      identity_path_elements[i] ==> selectors[i].path_elem;

      selectors[i].left ==> hashers[i].left;
      selectors[i].right ==> hashers[i].right;
    }

    identity_commitment.out ==> selectors[0].input_elem;

    for (var i = 1; i < n_levels; i++) {
      hashers[i-1].hash ==> selectors[i].input_elem;
    }

    root <== hashers[n_levels - 1].hash;
    // END tree

    // BEGIN nullifiers
    component nullifiers_hasher = MultiMiMC7(2, n_rounds);
    nullifiers_hasher.in[0] <== identity_nullifier;
    nullifiers_hasher.in[1] <== external_nullifier;
    nullifiers_hasher.k <== 0;

    nullifiers_hash <== nullifiers_hasher.out;
    // END nullifiers

    // BEGIN verify sig
    component msg_hasher = MultiMiMC7(3, n_rounds);
    msg_hasher.in[0] <== external_nullifier;
    msg_hasher.in[1] <== signal_hash;
    msg_hasher.in[2] <== broadcaster_address;
    msg_hasher.k <== 0;

    component sig_verifier = EdDSAMiMCVerifier();
    1 ==> sig_verifier.enabled;
    identity_pk[0] ==> sig_verifier.Ax;
    identity_pk[1] ==> sig_verifier.Ay;
    auth_sig_r[0] ==> sig_verifier.R8x;
    auth_sig_r[1] ==> sig_verifier.R8y;
    auth_sig_s ==> sig_verifier.S;
    msg_hasher.out ==> sig_verifier.M;

    // END verify sig
}
