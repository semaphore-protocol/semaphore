require('module-alias/register')
jest.setTimeout(1000000)

import * as path from 'path'
import * as snarkjs from 'snarkjs'
const bigInt = snarkjs.bigInt
import * as crypto from 'crypto'
import * as compiler from 'circom'

describe("Uint32 test", () => {
    test("Should add 5 Uint32s", async () => {
        const cirDef = await compiler(path.join(__dirname, "uint32_add_test.circom"))
        const circuit = new snarkjs.Circuit(cirDef)

        console.log("Vars: "+circuit.nVars)
        console.log("Constraints: "+circuit.nConstraints)

        const inputs = {}

        const nums = [4294967295, 4294967294, 4294967293, 4294967292, 4294967291]
        for (let i = 0; i < nums.length; i++) {
          let num = bigInt(nums[i])
          //inputs[`nums_vals[${i}]`] = num
          for (let j = 0; j < 32; j++) {
            // this extracts the least significant bit
            const bit = num.and(bigInt(1))
            inputs[`nums_bits[${i}][${j}]`] = bit
            num = num.shr(1)
          }
        }
        const witness = circuit.calculateWitness(inputs)

        let expected_num = nums.reduce((result, current) => {
          if (result == bigInt(-1)) {
            result = bigInt(current)
          } else {
            result = result.add(bigInt(current))
          }
          return result
        }, bigInt(-1))
        let expected_bits: number[] = []
        for (let j = 0; j < 32; j++) {
          const bit = expected_num.and(bigInt(1))
          expected_bits.push(bit)
          expected_num = expected_num.shr(1)
        }

        for (let i = 0; i < 32; i++) {
          expect(witness[circuit.getSignalIdx(`main.out_bits[${i}]`)].toString()).toEqual(snarkjs.bigInt(expected_bits[i]).toString())
        }
    })

    test("Should xor 2 Uint32s", async () => {
        const cirDef = await compiler(path.join(__dirname, "uint32_xor_test.circom"))
        const circuit = new snarkjs.Circuit(cirDef)

        console.log("Vars: "+circuit.nVars)
        console.log("Constraints: "+circuit.nConstraints)

        const inputs = {}

        const nums = [24959295, 4594067494]
        for (let i = 0; i < nums.length; i++) {
          let num = bigInt(nums[i])
          //inputs[`nums_vals[${i}]`] = num
          for (let j = 0; j < 32; j++) {
            // this extracts the least significant bit
            const bit = num.and(bigInt(1))
            let var_name
            if (i == 0) {
              var_name = 'a'
            } else {
              var_name = 'b'
            }
            inputs[`${var_name}_bits[${j}]`] = bit
            num = num.shr(1)
          }
        }
        const witness = circuit.calculateWitness(inputs)

        let expected_num = bigInt(nums[0] ^ nums[1])
        let expected_bits: number[] = []
        for (let j = 0; j < 32; j++) {
          const bit = expected_num.and(bigInt(1))
          expected_bits.push(bit)
          expected_num = expected_num.shr(1)
        }

        for (let i = 0; i < 32; i++) {
          expect(witness[circuit.getSignalIdx(`main.out_bits[${i}]`)].toString()).toEqual(snarkjs.bigInt(expected_bits[i]).toString())
        }
    })
})
