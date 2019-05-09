const chai = require('chai');
const path = require('path');
const snarkjs = require('snarkjs');
const compiler = require('circom');
const fs = require('fs');
const circomlib = require('circomlib');

const assert = chai.assert;

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimc7 = circomlib.mimc7;

let build_merkle_tree_example = (n_levels, index, identity_commitment) => {
  let tree = [];
  let current_index = index;
  let path_index = [];
  let path_elements = [];
  for (let i = 0; i < n_levels; i++) {
    let tree_level = [];
    path_index.push(current_index % 2);
    for (let j = 0; j < Math.pow(2, n_levels - i); j++) {
      if (i == 0) {
        if (j == index) {
          tree_level.push(identity_commitment);
        } else {
          tree_level.push(bigInt(j));
        }
      } else {
        tree_level.push(mimc7.multiHash([ tree[i-1][2*j], tree[i-1][2*j+1] ]));
      }
    }
    if (current_index % 2 == 0) {
      path_elements.push(tree_level[current_index + 1]);
    } else {
      path_elements.push(tree_level[current_index - 1]);
    }

    tree.push(tree_level);
    current_index = Math.floor(current_index / 2);
  }

  const root = mimc7.multiHash([ tree[n_levels - 1][0], tree[n_levels - 1][1] ]);

  return [root, tree, path_elements, path_index];
};

describe('circuit test', function () {
    let circuit;

    this.timeout(100000);

    before( async () => {
      const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
      circuit = new snarkjs.Circuit(cirDef);

      console.log('NConstrains Semaphore: ' + circuit.nConstraints);
  });

  it('does it', () => {
        const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const external_nullifier = bigInt('1');
        const signal_hash = bigInt('5');

        const msg = mimc7.multiHash([external_nullifier, signal_hash]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = bigInt('230');
        const identity_r = bigInt('12311');
        const tree = build_merkle_tree_example(4, 5, mimc7.multiHash([pubKey[0], pubKey[1], identity_nullifier, identity_r]));

        const identity_path_elements = tree[2];
        const identity_path_index = tree[3];

        const w = circuit.calculateWitness({
            'identity_pk[0]': pubKey[0],
            'identity_pk[1]': pubKey[1],
            'auth_sig_r[0]': signature.R8[0],
            'auth_sig_r[1]': signature.R8[1],
            auth_sig_s: signature.S,
            signal_hash,
            external_nullifier,
            identity_nullifier,
            identity_r,
            identity_path_elements,
            identity_path_index,
        });
        //console.log(w[circuit.getSignalIdx('main.signal_hash')]);
        //console.log(w[circuit.getSignalIdx('main.root')]);
        assert(circuit.checkWitness(w));
        assert(w[circuit.getSignalIdx('main.root')] == tree[0]);
  });
});
