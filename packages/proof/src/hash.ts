import type { BigNumberish } from "ethers"
import { keccak256 } from "ethers/crypto"
import { toBeHex } from "ethers/utils"
import { NumericString } from "snarkjs"

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(message: BigNumberish): NumericString {
    // SNARK scalar field modulus (Baby Jubjub curve)
    const SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n
    
    const hashValue = BigInt(keccak256(toBeHex(message, 32)))
    return (hashValue % SNARK_SCALAR_FIELD).toString()
}
