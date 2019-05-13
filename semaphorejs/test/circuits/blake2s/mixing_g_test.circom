include "../../../snark/blake2s/blake2s.circom";

template MixingGTester(a, b, c, d) {
  signal input in_v[16][32];
  signal input x[32];
  signal input y[32];

  signal out_v[16][32];

  component mixing_g = MixingG(a, b, c, d);
  for (var i = 0; i < 32; i++) {
    mixing_g.x[i] <== x[i];
    mixing_g.y[i] <== y[i];
    for (var j = 0; j < 16; j++) {
      mixing_g.in_v[j][i] <== in_v[j][i];
      mixing_g.out_v[j][i] <== out_v[j][i];
    }
  }
}

component main = MixingGTester(1, 2, 3, 4);
