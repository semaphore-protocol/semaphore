import { ByteArray, crypto } from "@graphprotocol/graph-ts"

/**
 * Calculates the LeanIMT depth from its number of leaves.
 * @param size Number of leaves, including removed members replaced with zero.
 * @returns Zero for at most one leaf, otherwise ceil(log2(size)).
 */
export function getMerkleTreeDepth(size: i32): i32 {
    let depth = 0
    let remaining = size - 1

    while (remaining > 0) {
        remaining >>= 1
        depth += 1
    }

    return depth
}

/**
 * Concatenates two byte arrays.
 * @param a First byte array.
 * @param b Second byte array.
 * @returns Final concatenated byte array.
 */
export function concat(a: ByteArray, b: ByteArray): ByteArray {
    const c = new ByteArray(a.length + b.length)

    c.set(a)
    c.set(b, a.length)

    return c
}

/**
 * Creates a Keccak256 hash.
 * @param message Message to hash.
 * @returns Hexadecimal string of the Keccak256 hash.
 */
export function hash(message: ByteArray): string {
    return crypto.keccak256(message).toHexString()
}
