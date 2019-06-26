const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");
const bigInt = snarkjs.bigInt;
const crypto = require("crypto");

const compiler = require("circom");

const assert = chai.assert;

const fs = require('fs');

// const printSignal = require("./helpers/printsignal");


describe("blake2s test", () => {
    it("Should compile mixing_g", async () => {
        const cirDef = await compiler(path.join(__dirname, "mixing_g_test.circom"));
        const circuit = new snarkjs.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

    }).timeout(1000000);

    it("Should compile blake2s_compression", async () => {
        const cirDef = await compiler(path.join(__dirname, "blake2s_compression_test.circom"));
        const circuit = new snarkjs.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

    }).timeout(1000000);

    it("Should run blake2s", async () => {
      const cirDef = await compiler(path.join(__dirname, "blake2s_test.circom"));
      fs.writeFileSync('blake2sdef.json', JSON.stringify(cirDef));
      //const cirDef = JSON.parse(fs.readFileSync('blake2sdef.json'));
        const circuit = new snarkjs.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

        const bits = '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        const inputs = {};
        for (let i = 0; i < bits.length; i++) {
          inputs[`in_bits[${i}]`] = bigInt(bits[i]);
        }
        const witness = circuit.calculateWitness(inputs);

        let coeff = bigInt(1);
        let result = bigInt(0);
        for (let i = 0; i < 256; i++) {
          result = result.add(bigInt(witness[circuit.getSignalIdx(`main.out[${i}]`)].toString()).mul(coeff));
          //assert.equal(witness[circuit.getSignalIdx(`main.out_bits[${i}]`)].toString(), snarkjs.bigInt(expected_bits[i]).toString());
          coeff = coeff.shl(1);
        }
        console.log(`blake2s hash: 0x${result.toString(16)}`);
        assert.equal(result.toString(16), 'c8a7a6e87d10557e3214979b2dda05b16a0e845a7367bcacb1890bfed50aaa97');

        for (let i = 0; i < witness.length; i++) {
          //console.log(circuit.signalNames(i));
        }

        /*
        process.stdout.write('h: ');
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 32; j++) {
            process.stdout.write(witness[circuit.getSignalIdx(`main.h[${i}][${j}]`)].toString());
          }
          process.stdout.write(' ');
        }
        console.log('');

        process.stdout.write('out: ');
        for (let i = 0; i < 256; i++) {
          process.stdout.write(witness[circuit.getSignalIdx(`main.out[${i}]`)].toString());
        }
        console.log('');
        */

    }).timeout(1000000);

});
