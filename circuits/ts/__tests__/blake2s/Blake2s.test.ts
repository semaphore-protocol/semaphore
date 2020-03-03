require('module-alias/register')
jest.setTimeout(1000000)

import * as path from 'path'
import * as snarkjs from 'snarkjs'
const bigInt = snarkjs.bigInt
import * as crypto from 'crypto'
import * as compiler from 'circom'

describe('Blake2s should match test vectors', () => {
    test('Should compile mixing_g', async () => {
        const cirDef = await compiler(path.join(__dirname, 'mixing_g_test.circom'))
        const circuit = new snarkjs.Circuit(cirDef)

        console.log('Vars: '+circuit.nVars)
        console.log('Constraints: '+circuit.nConstraints)

    })

    test('Should compile blake2s_compression', async () => {
        const cirDef = await compiler(path.join(__dirname, 'blake2s_compression_test.circom'))
        const circuit = new snarkjs.Circuit(cirDef)

        console.log('Vars: '+circuit.nVars)
        console.log('Constraints: '+circuit.nConstraints)
    })

    test('Should run blake2s', async () => {
        const cirDef = await compiler(path.join(__dirname, 'blake2s_test.circom'))
        const circuit = new snarkjs.Circuit(cirDef)

        console.log('Vars: '+circuit.nVars)
        console.log('Constraints: '+circuit.nConstraints)

        const bits = '11111111'
        const inputs = {}
        for (let i = 0; i < bits.length; i++) {
          inputs[`in_bits[${i}]`] = bigInt(bits[i])
        }
        const witness = circuit.calculateWitness(inputs)

        let coeff = bigInt(1)
        let result = bigInt(0)
        for (let i = 0; i < 256; i++) {
          result = result.add(bigInt(witness[circuit.getSignalIdx(`main.out[${i}]`)].toString()).mul(coeff))
          coeff = coeff.shl(1)
        }
        console.log(`blake2s hash: 0x${result.toString(16)}`)
        expect(result.toString(16)).toEqual('8a1ef126b4e286703744a80b2f414be700cc93023e7bfc8688b79b54931abd27')
    })
})
