include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/eddsamimcsponge.circom";
include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/assert.circom";
include "./blake2s/blake2s.circom";

template HashLeftRight() {
  signal input left;
  signal input right;

  signal output hash;

  component hasher = MiMCSponge(2, 1);
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

  path_index * (1-path_index) === 0

  component mux = MultiMux1(2);
  mux.c[0][0] <== input_elem;
  mux.c[0][1] <== path_elem;

  mux.c[1][0] <== path_elem;
  mux.c[1][1] <== input_elem;

  mux.s <== path_index;

  left <== mux.out[0];
  right <== mux.out[1];
}

template MerkleTreeInclusionProof(n_levels) {
    signal input identity_commitment;
    signal input identity_path_index[n_levels];
    signal input identity_path_elements[n_levels];
    signal output root;

    component selectors[n_levels];
    component hashers[n_levels];

    for (var i = 0; i < n_levels; i++) {
      selectors[i] = Selector();
      hashers[i] = HashLeftRight();

      identity_path_index[i] ==> selectors[i].path_index;
      identity_path_elements[i] ==> selectors[i].path_elem;

      selectors[i].left ==> hashers[i].left;
      selectors[i].right ==> hashers[i].right;
    }

    identity_commitment ==> selectors[0].input_elem;

    for (var i = 1; i < n_levels; i++) {
      hashers[i-1].hash ==> selectors[i].input_elem;
    }

    root <== hashers[n_levels - 1].hash;
}

template CalculateIdentityCommitment(IDENTITY_PK_SIZE_IN_BITS, NULLIFIER_TRAPDOOR_SIZE_IN_BITS) {
  signal input identity_pk[IDENTITY_PK_SIZE_IN_BITS];
  signal input identity_nullifier[NULLIFIER_TRAPDOOR_SIZE_IN_BITS];
  signal input identity_trapdoor[NULLIFIER_TRAPDOOR_SIZE_IN_BITS];

  signal output out;

  // identity commitment is a pedersen hash of (identity_pk, identity_nullifier, identity_trapdoor), each element padded up to 256 bits
  component identity_commitment = Pedersen(3*256);
  for (var i = 0; i < 256; i++) {
    if (i < IDENTITY_PK_SIZE_IN_BITS) {
      identity_commitment.in[i] <== identity_pk[i];
    } else {
      identity_commitment.in[i] <== 0;
    }

    if (i < NULLIFIER_TRAPDOOR_SIZE_IN_BITS) {
      identity_commitment.in[i + 256] <== identity_nullifier[i];
      identity_commitment.in[i + 2*256] <== identity_trapdoor[i];
    } else {
      identity_commitment.in[i + 256] <== 0;
      identity_commitment.in[i + 2*256] <== 0;
    }
  }

  out <== identity_commitment.out[0];
}

template CalculateNullifier(NULLIFIER_TRAPDOOR_SIZE_IN_BITS, EXTERNAL_NULLIFIER_SIZE_IN_BITS, n_levels) {
  signal input external_nullifier;
  signal input identity_nullifier[NULLIFIER_TRAPDOOR_SIZE_IN_BITS];
  signal input identity_path_index[n_levels];

  signal output nullifiers_hash;

  component external_nullifier_bits = Num2Bits(EXTERNAL_NULLIFIER_SIZE_IN_BITS);
  external_nullifier_bits.in <== external_nullifier;

  var nullifiers_hasher_bits = NULLIFIER_TRAPDOOR_SIZE_IN_BITS + EXTERNAL_NULLIFIER_SIZE_IN_BITS + n_levels;
  if (nullifiers_hasher_bits < 512) {
    nullifiers_hasher_bits = 512;
  }
  assert (nullifiers_hasher_bits <= 512);

  component nullifiers_hasher = Blake2s(nullifiers_hasher_bits, 0);
  for (var i = 0; i < NULLIFIER_TRAPDOOR_SIZE_IN_BITS; i++) {
    nullifiers_hasher.in_bits[i] <== identity_nullifier[i];
  }

  for (var i = 0; i < EXTERNAL_NULLIFIER_SIZE_IN_BITS; i++) {
    nullifiers_hasher.in_bits[NULLIFIER_TRAPDOOR_SIZE_IN_BITS + i] <== external_nullifier_bits.out[i];
  }

  for (var i = 0; i < n_levels; i++) {
    nullifiers_hasher.in_bits[NULLIFIER_TRAPDOOR_SIZE_IN_BITS + EXTERNAL_NULLIFIER_SIZE_IN_BITS + i] <== identity_path_index[i];
  }

  for (var i = (NULLIFIER_TRAPDOOR_SIZE_IN_BITS + EXTERNAL_NULLIFIER_SIZE_IN_BITS + n_levels); i < nullifiers_hasher_bits; i++) {
    nullifiers_hasher.in_bits[i] <== 0;
  }

  component nullifiers_hash_num = Bits2Num(250);
  for (var i = 0; i < 250; i++) {
    nullifiers_hash_num.in[i] <== nullifiers_hasher.out[i];
  }

  nullifiers_hash <== nullifiers_hash_num.out;
}

// n_levels must be < 32
template Semaphore(n_levels) {
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

    // mimc hash
    signal output root;
    signal output nullifiers_hash;

    // END signals

    // BEGIN constants

    var IDENTITY_PK_SIZE_IN_BITS = 254;
    var NULLIFIER_TRAPDOOR_SIZE_IN_BITS = 248;
    var EXTERNAL_NULLIFIER_SIZE_IN_BITS = 232;

    // END constants

    fake_zero === 0;

    component verify_identity_pk_on_curve = BabyCheck();
    verify_identity_pk_on_curve.x <== identity_pk[0];
    verify_identity_pk_on_curve.y <== identity_pk[1];

    component verify_auth_sig_r_on_curve = BabyCheck();
    verify_auth_sig_r_on_curve.x <== auth_sig_r[0];
    verify_auth_sig_r_on_curve.y <== auth_sig_r[1];

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

    component identity_nullifier_bits = Num2Bits(NULLIFIER_TRAPDOOR_SIZE_IN_BITS);
    identity_nullifier_bits.in <== identity_nullifier;

    component identity_trapdoor_bits = Num2Bits(NULLIFIER_TRAPDOOR_SIZE_IN_BITS);
    identity_trapdoor_bits.in <== identity_trapdoor;

    component identity_pk_0_bits = Num2Bits_strict();
    identity_pk_0_bits.in <== dbl3.xout;

    // BEGIN identity commitment
    component identity_commitment = CalculateIdentityCommitment(IDENTITY_PK_SIZE_IN_BITS, NULLIFIER_TRAPDOOR_SIZE_IN_BITS);
    for (var i = 0; i < IDENTITY_PK_SIZE_IN_BITS; i++) {
      identity_commitment.identity_pk[i] <== identity_pk_0_bits.out[i];
    }
    for (var i = 0; i < NULLIFIER_TRAPDOOR_SIZE_IN_BITS; i++) {
      identity_commitment.identity_nullifier[i] <== identity_nullifier_bits.out[i];
      identity_commitment.identity_trapdoor[i] <== identity_trapdoor_bits.out[i];
    }
    // END identity commitment

    // BEGIN tree
    component tree = MerkleTreeInclusionProof(n_levels);
    tree.identity_commitment <== identity_commitment.out;
    for (var i = 0; i < n_levels; i++) {
      tree.identity_path_index[i] <== identity_path_index[i];
      tree.identity_path_elements[i] <== identity_path_elements[i];
    }
    root <== tree.root;
    // END tree

    // BEGIN nullifiers
    component nullifiers_hasher = CalculateNullifier(NULLIFIER_TRAPDOOR_SIZE_IN_BITS, EXTERNAL_NULLIFIER_SIZE_IN_BITS, n_levels);
    nullifiers_hasher.external_nullifier <== external_nullifier;
    for (var i = 0; i < NULLIFIER_TRAPDOOR_SIZE_IN_BITS; i++) {
      nullifiers_hasher.identity_nullifier[i] <== identity_nullifier_bits.out[i];
    }
    for (var i = 0; i < n_levels; i++) {
      nullifiers_hasher.identity_path_index[i] <== identity_path_index[i];
    }
    nullifiers_hash <== nullifiers_hasher.nullifiers_hash;
    // END nullifiers

    // BEGIN verify sig
    component msg_hasher = MiMCSponge(2, 1);
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
