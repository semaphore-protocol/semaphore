import { BigNumber } from "@ethersproject/bignumber"
import { randomBytes } from "@ethersproject/random"

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31): bigint {
    return BigNumber.from(randomBytes(numberOfBytes)).toBigInt()
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
