// based on https://github.com/zcash/librustzcash/blob/master/sapling-crypto/src/circuit/uint32.rs

include "../../node_modules/circomlib/circuits/bitify.circom";

template Uint32Add(n) {
  signal input nums_bits[n][32];
  signal output out_bits[32];

  var result_num_bits = 32 + n - 1;
  signal result_bits[result_num_bits];
  signal nums_vals[n];
  signal result_val[n];

  var coeff;
  var num_lc;

  var lc = 0;
  for (var i = 0; i < n; i++) {
    num_lc = 0;
    coeff = 1;
    for (var j = 0; j < 32; j++) {
      lc += nums_bits[i][j]*coeff;
      num_lc += nums_bits[i][j]*coeff;
      coeff *= 2;
    }
    nums_vals[i] <== num_lc;

    if (i == 0) {
      result_val[i] <== nums_vals[i];
    } else {
      result_val[i] <== result_val[i-1] + nums_vals[i];
    }

  }

  var result_lc = 0;
  coeff = 1;
  for (var i = 0; i < result_num_bits; i++) {

    result_bits[i] <-- (result_val[n-1] >> i) & 1;
    result_bits[i] * (result_bits[i] - 1) === 0;

    result_lc += result_bits[i]*coeff;
    coeff *= 2;
  }

  result_lc === lc;
  for (var i = 0; i < 32; i++) {
    out_bits[i] <== result_bits[i];
  }
}

template Uint32Xor() {
  signal input a_bits[32];
  signal input b_bits[32];

  signal output out_bits[32];

  for (var i = 0; i < 32; i++) {
    out_bits[i] <== a_bits[i] + b_bits[i] - 2*a_bits[i]*b_bits[i];
  }
}
