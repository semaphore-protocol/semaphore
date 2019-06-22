include "../node_modules/circomlib/circuits/mimcsponge.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/eddsamimcsponge.circom";
include "./blake2s/blake2s.circom";

template HashLeftRight(n_rounds) {
  signal input left;
  signal input right;

  signal output hash;

  component hasher = MiMCSponge(2, n_rounds, 1);
  left ==> hasher.ins[0];
  right ==> hasher.ins[1];
  hasher.k <== 0;

  hash <== hasher.outs[0];
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


    component identity_nullifier_bits = Num2Bits(256);
    identity_nullifier_bits.in <== identity_nullifier;

    component identity_pk_0_bits = Num2Bits(256);
    identity_pk_0_bits.in <== identity_pk[0];

    component identity_pk_1_bits = Num2Bits(256);
    identity_pk_1_bits.in <== identity_pk[1];

    component identity_r_bits = Num2Bits(256);
    identity_r_bits.in <== identity_r;

    component identity_commitment = Blake2s(4*256, 0);
    // BEGIN identity commitment
    for (var i = 0; i < 256; i++) {
      identity_commitment.in_bits[i] <== identity_pk_0_bits.out[i];
      identity_commitment.in_bits[i + 256] <== identity_pk_1_bits.out[i];
      identity_commitment.in_bits[i + 2*256] <== identity_nullifier_bits.out[i];
      identity_commitment.in_bits[i + 3*256] <== identity_r_bits.out[i];
    }
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

    component identity_commitment_num = Bits2Num(253);
    for (var i = 0; i < 253; i++) {
      identity_commitment_num.in[i] <== identity_commitment.out[i];
    }

    identity_commitment_num.out ==> selectors[0].input_elem;

    for (var i = 1; i < n_levels; i++) {
      hashers[i-1].hash ==> selectors[i].input_elem;
    }

    root <== hashers[n_levels - 1].hash;
    // END tree

    // BEGIN nullifiers
    component external_nullifier_bits = Num2Bits(256);
    external_nullifier_bits.in <== external_nullifier;

    component nullifiers_hasher = Blake2s(512, 0);
    for (var i = 0; i < 256; i++) {
      nullifiers_hasher.in_bits[i] <== identity_nullifier_bits.out[i];
      nullifiers_hasher.in_bits[256 + i] <== external_nullifier_bits.out[i];
    }

    component nullifiers_hash_num = Bits2Num(253);
    for (var i = 0; i < 253; i++) {
      nullifiers_hash_num.in[i] <== nullifiers_hasher.out[i];
    }

    nullifiers_hash <== nullifiers_hash_num.out;

    // END nullifiers

    // BEGIN verify sig
    component msg_hasher = MiMCSponge(3, n_rounds, 1);
    msg_hasher.ins[0] <== external_nullifier;
    msg_hasher.ins[1] <== signal_hash;
    msg_hasher.ins[2] <== broadcaster_address;
    msg_hasher.k <== 0;

    component sig_verifier = EdDSAMiMCSpongeVerifier();
    1 ==> sig_verifier.enabled;
    identity_pk[0] ==> sig_verifier.Ax;
    identity_pk[1] ==> sig_verifier.Ay;
    auth_sig_r[0] ==> sig_verifier.R8x;
    auth_sig_r[1] ==> sig_verifier.R8y;
    auth_sig_s ==> sig_verifier.S;
    msg_hasher.outs[0] ==> sig_verifier.M;

    // END verify sig
}
