include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template HashLeftRight(jubjub_field_size) {
  signal input left[jubjub_field_size];
  signal input right[jubjub_field_size];

  signal output hash;

  component hasher = Pedersen(2*jubjub_field_size);
  for (var j = 0; j < jubjub_field_size; j++) {
    left[j] ==> hasher.in[j];
    right[j] ==> hasher.in[jubjub_field_size + j];
  }

  hash <== hasher.out[0];
}

template Semaphore(jubjub_field_size, n_levels) {
    // pedersen hash
    signal input root;

    signal input signal_hash;

    // pedersen vector commitment
    signal private input identity_sk;
    signal private input identity_nullifier;
    signal private input identity_r;

    signal private input identity_path_elements[n_levels];
    signal private input identity_path_index[n_levels];

    // auth signature randomness
    signal private input auth_r;

    // pedersen vector commitment
    signal output auth_sig;
    signal output nullifiers_hash;

    component identity_sk_bits = Num2Bits(jubjub_field_size);
    identity_sk ==> identity_sk_bits.in;

    component identity_nullifier_bits = Num2Bits(jubjub_field_size);
    identity_nullifier ==> identity_nullifier_bits.in;

    component identity_r_bits = Num2Bits(jubjub_field_size);
    identity_r ==> identity_r_bits.in;

    component identity_commitment = Pedersen(3*jubjub_field_size);

    for (var i = 0; i < jubjub_field_size; i++) {
      identity_commitment.in[i] <== identity_sk_bits.out[i];
      identity_commitment.in[jubjub_field_size + i] <== identity_nullifier_bits.out[i];
      identity_commitment.in[2*jubjub_field_size + i] <== identity_r_bits.out[i];
    }

    component hashers[n_levels];
    component left_bits[n_levels];
    component right_bits[n_levels];

    signal private input lefts[n_levels];
    signal private input rights[n_levels];

    signal private input left_selector_1[n_levels];
    signal private input left_selector_2[n_levels];
    signal private input right_selector_1[n_levels];
    signal private input right_selector_2[n_levels];

    hashers[0] = HashLeftRight(jubjub_field_size);
    left_bits[0] = Num2Bits(jubjub_field_size);
    right_bits[0] = Num2Bits(jubjub_field_size);

    left_selector_1[0] <== (1 - identity_path_index[0])*identity_commitment.out[0];
    left_selector_2[0] <== (identity_path_index[0])*identity_path_elements[0];
    right_selector_1[0] <== (identity_path_index[0])*identity_commitment.out[0];
    right_selector_2[0] <== (1 - identity_path_index[0])*identity_path_elements[0];

    lefts[0] <== left_selector_1[0] + left_selector_2[0];
    rights[0] <== right_selector_1[0] + right_selector_2[0];

    lefts[0] ==> left_bits[0].in;
    rights[0] ==> right_bits[0].in;

    for (var j = 0; j < jubjub_field_size; j++) {
      left_bits[0].out[j] ==> hashers[0].left[j];
      right_bits[0].out[j] ==> hashers[0].right[j];
    }

    for (var i = 1; i < n_levels; i++) {
      hashers[i] = HashLeftRight(jubjub_field_size);
      left_bits[i] = Num2Bits(jubjub_field_size);
      right_bits[i] = Num2Bits(jubjub_field_size);

      left_selector_1[i] <== (1 - identity_path_index[i])*hashers[i-1].hash;
      left_selector_2[i] <== (identity_path_index[i])*identity_path_elements[i];
      right_selector_1[i] <== (identity_path_index[i])*hashers[i-1].hash;
      right_selector_2[i] <== (1 - identity_path_index[i])*identity_path_elements[i];

      lefts[i] <== left_selector_1[i] + left_selector_2[i];
      rights[i] <== right_selector_1[i] + right_selector_2[i];


      lefts[i] ==> left_bits[i].in;
      rights[i] ==> right_bits[i].in;

      for (var j = 0; j < jubjub_field_size; j++) {
        left_bits[i].out[j] ==> hashers[i].left[j];
        right_bits[i].out[j] ==> hashers[i].right[j];
      }
    }

    root <== hashers[n_levels - 1].hash;
}

component main = Semaphore(251, 20);
