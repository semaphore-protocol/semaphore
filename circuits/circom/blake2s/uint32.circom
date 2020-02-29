include "../../node_modules/circomlib/circuits/binsum.circom";

template Uint32Add(n) {
  signal input nums_bits[n][32];
  signal output out_bits[32];

  component sum = BinSum(32, n);
  var i;
  var j;
  for (i = 0; i < n; i++) {
    for (j = 0; j < 32; j++) {
      sum.in[i][j] <== nums_bits[i][j];
    }
  }

  for (j = 0; j < 32; j++) {
    out_bits[j] <== sum.out[j];
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
