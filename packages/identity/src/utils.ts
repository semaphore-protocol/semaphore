import { BigNumber } from "@ethersproject/bignumber"
import { randomBytes } from "@ethersproject/random"
import { poseidon1 } from "poseidon-lite/poseidon1"
import { poseidon2 } from "poseidon-lite/poseidon2"

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31): bigint {
    return BigNumber.from(randomBytes(numberOfBytes)).toBigInt()
}

/**
 * Generates the identity commitment from trapdoor and nullifier.
 * @param nullifier The identity nullifier.
 * @param trapdoor The identity trapdoor.
 * @returns identity commitment
 */
export function generateCommitment(nullifier: bigint, trapdoor: bigint): bigint {
    return poseidon1([poseidon2([nullifier, trapdoor])])
}

/**
 * Checks if a string is a JSON.
 * @param jsonString The JSON string.
 * @returns True or false.
 */
export function isJsonArray(jsonString: string) {
    try {
        return Array.isArray(JSON.parse(jsonString))
    } catch (error) {
        return false
    }
}
