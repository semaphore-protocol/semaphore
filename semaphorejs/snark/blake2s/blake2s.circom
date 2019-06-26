// based on https://github.com/zcash/librustzcash/blob/master/sapling-crypto/src/circuit/blake2s.rs

include "uint32.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/sha256/rotate.circom";

template MixingG(a, b, c, d) {
  signal input in_v[16][32];
  signal input x[32];
  signal input y[32];

  signal output out_v[16][32];

  component v_a_add = Uint32Add(3);
  for (var i = 0; i < 32; i++) {
    v_a_add.nums_bits[0][i] <== in_v[a][i];
    v_a_add.nums_bits[1][i] <== in_v[b][i];
    v_a_add.nums_bits[2][i] <== x[i];
  }

  component v_d_a_xor = Uint32Xor();
  for (var i = 0; i < 32; i++) {
    v_d_a_xor.a_bits[i] <== in_v[d][i];
    v_d_a_xor.b_bits[i] <== v_a_add.out_bits[i];
  }

  component v_d_a_rot = RotR(32, 16);
  for (var i = 0; i < 32; i++) {
    v_d_a_rot.in[i] <== v_d_a_xor.out_bits[i];
  }

  component v_c_add = Uint32Add(2);
  for (var i = 0; i < 32; i++) {
    v_c_add.nums_bits[0][i] <== in_v[c][i];
    v_c_add.nums_bits[1][i] <== v_d_a_rot.out[i];
  }

  component v_b_c_xor = Uint32Xor();
  for (var i = 0; i < 32; i++) {
    v_b_c_xor.a_bits[i] <== in_v[b][i];
    v_b_c_xor.b_bits[i] <== v_c_add.out_bits[i];
  }

  component v_b_c_rot = RotR(32, 12);
  for (var i = 0; i < 32; i++) {
    v_b_c_rot.in[i] <== v_b_c_xor.out_bits[i];
  }

  component v_a_add_2 = Uint32Add(3);
  for (var i = 0; i < 32; i++) {
    v_a_add_2.nums_bits[0][i] <== v_a_add.out_bits[i];
    v_a_add_2.nums_bits[1][i] <== v_b_c_rot.out[i];
    v_a_add_2.nums_bits[2][i] <== y[i];
  }

  component v_d_a_xor_2 = Uint32Xor();
  for (var i = 0; i < 32; i++) {
    v_d_a_xor_2.a_bits[i] <== v_d_a_rot.out[i];
    v_d_a_xor_2.b_bits[i] <== v_a_add_2.out_bits[i];
  }

  component v_d_a_rot_2 = RotR(32, 8);
  for (var i = 0; i < 32; i++) {
    v_d_a_rot_2.in[i] <== v_d_a_xor_2.out_bits[i];
  }

  component v_c_add_2 = Uint32Add(2);
  for (var i = 0; i < 32; i++) {
    v_c_add_2.nums_bits[0][i] <== v_c_add.out_bits[i];
    v_c_add_2.nums_bits[1][i] <== v_d_a_rot_2.out[i];
  }

  component v_b_c_xor_2 = Uint32Xor();
  for (var i = 0; i < 32; i++) {
    v_b_c_xor_2.a_bits[i] <== v_b_c_rot.out[i];
    v_b_c_xor_2.b_bits[i] <== v_c_add_2.out_bits[i];
  }

  component v_b_c_rot_2 = RotR(32, 7);
  for (var i = 0; i < 32; i++) {
    v_b_c_rot_2.in[i] <== v_b_c_xor_2.out_bits[i];
  }

  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 32; j++) {
      if (i == a) {
        out_v[i][j] <== v_a_add_2.out_bits[j];
      } else if (i == b) {
        out_v[i][j] <== v_b_c_rot_2.out[j];
      } else if (i == c) {
        out_v[i][j] <== v_c_add_2.out_bits[j];
      } else if (i == d) {
        out_v[i][j] <== v_d_a_rot_2.out[j];
      } else {
        out_v[i][j] <== in_v[i][j];
      }
    }
  }
}

template Blake2sCompression(t, f) {
  signal input in_h[8][32];
  signal input in_m[16][32];

  signal output out_h[8][32];

  var v_consts = [
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
  ];
  signal v_h[16][32];

  for (var i = 0; i < 16; i++) {
    if (i < 8) {
      for (var j = 0; j < 32; j++) {
        v_h[i][j] <== in_h[i][j];
      }
    } else {
      for (var j = 0; j < 32; j++) {
        v_h[i][j] <== (v_consts[i - 8] >> j) & 1;
      }
    }
  }

  signal v_pass_1[16][32];
  component v_12_xor = Uint32Xor();
  component v_13_xor = Uint32Xor();
  component v_14_xor = Uint32Xor();

  for (var i = 0; i < 16; i++) {
    if (i == 12) {
      for (var j = 0; j < 32; j++) {
        v_12_xor.a_bits[j] <== v_h[i][j];
        v_12_xor.b_bits[j] <== (t >> j) & 1;
      }
      for (var j = 0; j < 32; j++) {
        v_pass_1[i][j] <== v_12_xor.out_bits[j];
      }
    } else if (i == 13) {
      for (var j = 0; j < 32; j++) {
        v_13_xor.a_bits[j] <== v_h[i][j];
        v_13_xor.b_bits[j] <== (t >> (32 + j)) & 1;
      }
      for (var j = 0; j < 32; j++) {
        v_pass_1[i][j] <== v_13_xor.out_bits[j];
      }
    } else if ((i == 14)) {
      if (f == 1) {
        for (var j = 0; j < 32; j++) {
          v_14_xor.a_bits[j] <== v_h[i][j];
          v_14_xor.b_bits[j] <== 1;
        }
        for (var j = 0; j < 32; j++) {
          v_pass_1[i][j] <== v_14_xor.out_bits[j];
        }
      } else {
        for (var j = 0; j < 32; j++) {
          v_14_xor.a_bits[j] <== v_h[i][j];
          v_14_xor.b_bits[j] <== 0;
        }
        for (var j = 0; j < 32; j++) {
          v_pass_1[i][j] <== v_h[i][j];
        }
      }
    } else {
      for (var j = 0; j < 32; j++) {
        v_pass_1[i][j] <== v_h[i][j];
      }
    }
  }

  var sigma = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
  ];

  component mixing_g[10][8];
  var s;
  for (var i = 0; i < 10; i++) {
    s = sigma[i];
    mixing_g[i][0] = MixingG(0, 4, 8, 12);
    for (var j = 0; j < 16; j++) {
      for (var k = 0; k < 32; k++) {
        if (i == 0) {
          mixing_g[i][0].in_v[j][k] <== v_pass_1[j][k];
        } else {
          mixing_g[i][0].in_v[j][k] <== mixing_g[i - 1][7].out_v[j][k];
        }
      }
    }

    for (var k = 0; k < 32; k++) {
      mixing_g[i][0].x[k] <== in_m[s[0]][k];
      mixing_g[i][0].y[k] <== in_m[s[1]][k];
    }


    mixing_g[i][1] = MixingG(1, 5, 9, 13);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][1].in_v[j][k] <== mixing_g[i][0].out_v[j][k];
      }
      mixing_g[i][1].x[k] <== in_m[s[2]][k];
      mixing_g[i][1].y[k] <== in_m[s[3]][k];
    }

    mixing_g[i][2] = MixingG(2, 6, 10, 14);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][2].in_v[j][k] <== mixing_g[i][1].out_v[j][k];
      }
      mixing_g[i][2].x[k] <== in_m[s[4]][k];
      mixing_g[i][2].y[k] <== in_m[s[5]][k];
    }

    mixing_g[i][3] = MixingG(3, 7, 11, 15);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][3].in_v[j][k] <== mixing_g[i][2].out_v[j][k];
      }
      mixing_g[i][3].x[k] <== in_m[s[6]][k];
      mixing_g[i][3].y[k] <== in_m[s[7]][k];
    }

    mixing_g[i][4] = MixingG(0, 5, 10, 15);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][4].in_v[j][k] <== mixing_g[i][3].out_v[j][k];
      }
      mixing_g[i][4].x[k] <== in_m[s[8]][k];
      mixing_g[i][4].y[k] <== in_m[s[9]][k];
    }

    mixing_g[i][5] = MixingG(1, 6, 11, 12);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][5].in_v[j][k] <== mixing_g[i][4].out_v[j][k];
      }
      mixing_g[i][5].x[k] <== in_m[s[10]][k];
      mixing_g[i][5].y[k] <== in_m[s[11]][k];
    }

    mixing_g[i][6] = MixingG(2, 7, 8, 13);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][6].in_v[j][k] <== mixing_g[i][5].out_v[j][k];
      }
      mixing_g[i][6].x[k] <== in_m[s[12]][k];
      mixing_g[i][6].y[k] <== in_m[s[13]][k];
    }

    mixing_g[i][7] = MixingG(3, 4, 9, 14);
    for (var k = 0; k < 32; k++) {
      for (var j = 0; j < 16; j++) {
        mixing_g[i][7].in_v[j][k] <== mixing_g[i][6].out_v[j][k];
      }
      mixing_g[i][7].x[k] <== in_m[s[14]][k];
      mixing_g[i][7].y[k] <== in_m[s[15]][k];
    }
  }

  component h_xor_1[8];
  component h_xor_2[8];
  for (var i = 0; i < 8; i++) {
    h_xor_1[i] = Uint32Xor();
    h_xor_2[i] = Uint32Xor();
    for (var j = 0; j < 32; j++) {
      h_xor_1[i].a_bits[j] <== in_h[i][j];
      h_xor_1[i].b_bits[j] <== mixing_g[9][7].out_v[i][j];
    }

    for (var j = 0; j < 32; j++) {
      h_xor_2[i].a_bits[j] <== h_xor_1[i].out_bits[j];
      h_xor_2[i].b_bits[j] <== mixing_g[9][7].out_v[i + 8][j];
    }

    for (var j = 0; j < 32; j++) {
      out_h[i][j] <== h_xor_2[i].out_bits[j];
    }
  }
}

template Blake2s(n_bits, personalization) {
  signal input in_bits[n_bits];
  signal output out[256];

  signal h[8][32];
  component h_from_bits[8];
  component h6_xor;
  component h7_xor;

  var h_consts = [
    0x6A09E667 ^ 0x01010000 ^ 32,
    0xBB67AE85,
    0x3C6EF372,
    0xA54FF53A,
    0x510E527F,
    0x9B05688C,
    0x1F83D9AB,
    0x5BE0CD19
  ];

  for (var i = 0; i < 8; i++) {
    h_from_bits[i] = Num2Bits(32);
    h_from_bits[i].in <== h_consts[i];
    if (i == 6) {
      h6_xor = Uint32Xor();
      for (var j = 0; j < 32; j++) {
        h6_xor.a_bits[j] <== h_from_bits[i].out[j];
        h6_xor.b_bits[j] <== (personalization >> j) & 1;
      }
      for (var j = 0; j < 32; j++) {
        h[i][j] <== h6_xor.out_bits[j];
      }
    } else if (i == 7) {
      h7_xor = Uint32Xor();
      for (var j = 0; j < 32; j++) {
        h7_xor.a_bits[j] <== h_from_bits[i].out[j];
        h7_xor.b_bits[j] <== (personalization >> (32 + j)) & 1;
      }
      for (var j = 0; j < 32; j++) {
        h[i][j] <== h7_xor.out_bits[j];
      }
    } else {
      for (var j = 0; j < 32; j++) {
        h[i][j] <== h_from_bits[i].out[j];
      }
    }
  }

  var n_rounded;
  if ( (n_bits % 512) == 0) {
    n_rounded = n_bits;
  } else {
    n_rounded = n_bits + (512 - (n_bits % 512));
  }
  var num_blocks = n_rounded / 512;
  if (num_blocks == 0) {
    num_blocks = 1;
  }
  component compressions[num_blocks];
  var current_bit = 0;
  for (var i = 0; i < num_blocks; i++) {
    if (i < (num_blocks - 1)) {
      compressions[i] = Blake2sCompression((i + 1)*64, 0);
    } else {
      compressions[i] = Blake2sCompression((n_bits - (n_bits % 512))/8, 1);
    }
    for (var j = 0; j < 32; j++) {
      for (var k = 0; k < 8; k++) {
        if (i == 0) {
          compressions[i].in_h[k][j] <== h[k][j];
        } else {
          compressions[i].in_h[k][j] <== compressions[i - 1].out_h[k][j];
        }
      }
      for (var l = 0; l < 16; l++) {
        current_bit = 512*i + 32*l + j;
        if (current_bit < n_bits) {
          compressions[i].in_m[l][j] <== in_bits[current_bit];
        } else {
          compressions[i].in_m[l][j] <== 0;
        }
      }
    }

    if (i == (num_blocks - 1)) {
      for (var j = 0; j < 8; j++) {
        for (var k = 0; k < 4; k++) {
          for (var l = 0; l < 8; l++) {
            out[32*j + 8*k + l] <== compressions[num_blocks - 1].out_h[8 - 1 - j][(4 - 1 - k)*8 + l];
          }
        }
      }
    }
  }
}
