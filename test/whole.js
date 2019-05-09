const chai = require('chai');
const path = require('path');
const snarkjs = require('snarkjs');
const compiler = require('circom');
const fs = require('fs');

const eddsa = require('../node_modules/circomlib/src/eddsa.js');

const assert = chai.assert;

const bigInt = snarkjs.bigInt;

describe('whole use case test', function () {
    let circuit;

    this.timeout(100000);

    before( async () => {
      const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../build/circuit.json')).toString());
      circuit = new snarkjs.Circuit(cirDef);

      console.log('NConstrains Semaphore: ' + circuit.nConstraints);
  });

  it('does it', () => {
        const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const msg = bigInt(1234);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        /*
        const w = circuit.calculateWitness({
            enabled: 1,
            Ax: pubKey[0],
            Ay: pubKey[1],
            R8x: signature.R8[0],
            R8y: signature.R8[1],
            S: signature.S,
            M: msg});
        */

  });
});
