import { poseidon2 } from "poseidon-lite"

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash2(a: bigint, b: bigint): bigint {
    return poseidon2([a, b])
}
