const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");
const bigInt = snarkjs.bigInt;
const crypto = require("crypto");

const compiler = require("circom");

const assert = chai.assert;

// const printSignal = require("./helpers/printsignal");


describe("Uint32 test", () => {
    it("Should add 5 Uint32s", async () => {
        const cirDef = await compiler(path.join(__dirname, "uint32_add_test.circom"));
        const circuit = new snarkjs.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

        const inputs = {};

        const nums = [4294967295, 4294967294, 4294967293, 4294967292, 4294967291];
        for (let i = 0; i < nums.length; i++) {
          let num = bigInt(nums[i]);
          //inputs[`nums_vals[${i}]`] = num;
          const num_bits = [];
          for (let j = 0; j < 32; j++) {
            const bit = num.and(bigInt(1));
            inputs[`nums_bits[${i}][${j}]`] = bit;
            num = num.shr(1);
          }
        }
        const witness = circuit.calculateWitness(inputs);

        const expected_bits = [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        //const expected_num = bigInt(4294967281);

        for (let i = 0; i < 32; i++) {
          assert.equal(witness[circuit.getSignalIdx(`main.out_bits[${i}]`)].toString(), snarkjs.bigInt(expected_bits[i]).toString());
        }
    }).timeout(1000000);

    it("Should add xor 2 Uint32s", async () => {
        const cirDef = await compiler(path.join(__dirname, "uint32_xor_test.circom"));
        const circuit = new snarkjs.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

        const inputs = {};

        const nums = [24959295, 4594067494];
        for (let i = 0; i < nums.length; i++) {
          let num = bigInt(nums[i]);
          //inputs[`nums_vals[${i}]`] = num;
          const num_bits = [];
          for (let j = 0; j < 32; j++) {
            const bit = num.and(bigInt(1));
            let var_name;
            if (i == 0) {
              var_name = 'a';
            } else {
              var_name = 'b';
            }
            inputs[`${var_name}_bits[${j}]`] = bit;
            num = num.shr(1);
          }
        }
        const witness = circuit.calculateWitness(inputs);

        const expected_bits = [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1];
        //const expected_num = bigInt(4574884121);

        for (let i = 0; i < 32; i++) {
          assert.equal(witness[circuit.getSignalIdx(`main.out_bits[${i}]`)].toString(), snarkjs.bigInt(expected_bits[i]).toString());
        }
    }).timeout(1000000);




});
