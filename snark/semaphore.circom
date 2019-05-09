include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


template Semaphore(jubjub_field_size, n_levels) {
    // pedersen hash
    signal input root;

    signal input signal_hash;

    // pedersen vector commitment
    signal private input identity_sk;
    signal private input identity_nullifier;
    signal private input identity_r;

    signal private input identity_path_elements[n_levels][jubjub_field_size];
    signal private input identity_path_index[n_levels];

    // auth signature randomness
    signal private input auth_r;

    // pedersen vector commitment
    signal output auth_sig_x;
    signal output auth_sig_y;
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
    component level_bits[n_levels];
    for (var i = 0; i < n_levels; i++) {
      hashers[i] = Pedersen(2*jubjub_field_size);
      level_bits[i] = Num2Bits(jubjub_field_size);
      if (i == 0) {
        identity_commitment.out[0] ==> level_bits[i].in;
      } else {
        hashers[i-1].out[0] ==> level_bits[i].in;
      }
      for (var j = 0; j < jubjub_field_size; j++) {
        if (identity_path_index[i] == 0) {
          level_bits[i].out[j] ==> hashers[i].in[j];
          identity_path_elements[i][j] ==> hashers[i].in[jubjub_field_size + j];
        } else {
          level_bits[i].out[j] ==> hashers[i].in[jubjub_field_size + j];
          identity_path_elements[i][j] ==> hashers[i].in[j];
        }
      }
    }

    root <== hashers[n_levels - 1].out[0];
}

component main = Semaphore(251, 20);
