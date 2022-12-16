import { keccak256 } from "@ethersproject/keccak256"
import { toUtf8Bytes } from "@ethersproject/strings"

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(message: string): bigint {
    return BigInt(keccak256(toUtf8Bytes(message))) >> BigInt(8)
}
