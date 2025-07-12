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
    return (BigInt(keccak256(toBeHex(message, 32))) >> 8n).toString()
}
