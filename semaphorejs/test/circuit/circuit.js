/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

const chai = require('chai');
const path = require('path');
const snarkjs = require('snarkjs');
const compiler = require('circom');
const fs = require('fs');
const circomlib = require('circomlib');

const test_util = require('../../src/test_util');
const build_merkle_tree_example = test_util.build_merkle_tree_example;

const assert = chai.assert;

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimc7 = circomlib.mimc7;

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
        const broadcaster_address = bigInt('0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413');

        const msg = mimc7.multiHash([bigInt(external_nullifier), bigInt(signal_hash), bigInt(broadcaster_address)]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = bigInt('230');
        const identity_r = bigInt('12311');
        const tree = build_merkle_tree_example(20, mimc7.multiHash([bigInt(pubKey[0]), bigInt(pubKey[1]), bigInt(identity_nullifier), bigInt(identity_r)]));

        const identity_path_elements = tree[1];
        const identity_path_index = tree[2];
        //console.log(tree);

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
            broadcaster_address,
        });
        //console.log(w[circuit.getSignalIdx('main.signal_hash')]);
        //console.log(w[circuit.getSignalIdx('main.root')]);
        assert.equal(w[circuit.getSignalIdx('main.broadcaster_address')].toString(16), broadcaster_address.toString(16));
        assert(circuit.checkWitness(w));
        assert(w[circuit.getSignalIdx('main.root')] == tree[0]);
  });
});
