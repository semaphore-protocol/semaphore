include "../node_modules/circomlib/circuits/pedersen.circom";
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
    
    signal private input fake_zero;

    // mimc vector commitment
    signal private input identity_pk[2];
    signal private input identity_nullifier;
    signal private input identity_trapdoor;
    signal private input identity_path_elements[n_levels];
    signal private input identity_path_index[n_levels];

    // signature on (external nullifier, signal_hash) with identity_pk
    signal private input auth_sig_r[2];
    signal private input auth_sig_s;

    // get a prime subgroup element derived from identity_pk
    component dbl1 = BabyDbl();
    dbl1.x <== identity_pk[0];
    dbl1.y <== identity_pk[1];
    component dbl2 = BabyDbl();
    dbl2.x <== dbl1.xout;
    dbl2.y <== dbl1.yout;
    component dbl3 = BabyDbl();
    dbl3.x <== dbl2.xout;
    dbl3.y <== dbl2.yout;

    // mimc hash
    signal output root;
    signal output nullifiers_hash;

    // END signals


    component identity_nullifier_bits = Num2Bits(248);
    identity_nullifier_bits.in <== identity_nullifier;

    component identity_trapdoor_bits = Num2Bits(248);
    identity_trapdoor_bits.in <== identity_trapdoor;

    component identity_pk_0_bits = Num2Bits_strict();
    identity_pk_0_bits.in <== dbl3.xout;

    component identity_commitment = Pedersen(3*256);
    // BEGIN identity commitment
    for (var i = 0; i < 256; i++) {
      if (i < 254) {
        identity_commitment.in[i] <== identity_pk_0_bits.out[i];
      } else {
        identity_commitment.in[i] <== 0;
      }

      if (i < 248) {
        identity_commitment.in[i + 256] <== identity_nullifier_bits.out[i];
        identity_commitment.in[i + 2*256] <== identity_trapdoor_bits.out[i];
      } else {
        identity_commitment.in[i + 256] <== 0;
        identity_commitment.in[i + 2*256] <== 0;
      }
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

    identity_commitment.out[0] ==> selectors[0].input_elem;

    for (var i = 1; i < n_levels; i++) {
      hashers[i-1].hash ==> selectors[i].input_elem;
    }

    root <== hashers[n_levels - 1].hash;
    fake_zero * root === fake_zero;
    // END tree

    // BEGIN nullifiers
    component external_nullifier_bits = Num2Bits(232);
    external_nullifier_bits.in <== external_nullifier;

    component nullifiers_hasher = Blake2s(512, 0);
    for (var i = 0; i < 248; i++) {
      nullifiers_hasher.in_bits[i] <== identity_nullifier_bits.out[i];
    }

    for (var i = 0; i < 232; i++) {
      nullifiers_hasher.in_bits[248 + i] <== external_nullifier_bits.out[i];
    }

    for (var i = 0; i < n_levels; i++) {
      nullifiers_hasher.in_bits[248 + 232 + i] <== identity_path_index[i];
    }

    for (var i = (248 + 232 + n_levels); i < 512; i++) {
      nullifiers_hasher.in_bits[i] <== 0;
    }

    component nullifiers_hash_num = Bits2Num(253);
    for (var i = 0; i < 253; i++) {
      nullifiers_hash_num.in[i] <== nullifiers_hasher.out[i];
    }

    nullifiers_hash <== nullifiers_hash_num.out;

    // END nullifiers

    // BEGIN verify sig
    component msg_hasher = MiMCSponge(2, n_rounds, 1);
    msg_hasher.ins[0] <== external_nullifier;
    msg_hasher.ins[1] <== signal_hash;
    msg_hasher.k <== 0;

    component sig_verifier = EdDSAMiMCSpongeVerifier();
    (1 - fake_zero) ==> sig_verifier.enabled;
    identity_pk[0] ==> sig_verifier.Ax;
    identity_pk[1] ==> sig_verifier.Ay;
    auth_sig_r[0] ==> sig_verifier.R8x;
    auth_sig_r[1] ==> sig_verifier.R8y;
    auth_sig_s ==> sig_verifier.S;
    msg_hasher.outs[0] ==> sig_verifier.M;

    // END verify sig
}
