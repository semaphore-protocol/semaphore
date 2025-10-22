import { ByteArray, crypto } from "@graphprotocol/graph-ts"

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