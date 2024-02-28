import { BarretenbergSync, Fr } from "@aztec/bb.js"
/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default async function hash(a: Fr, b: Fr): Promise<Fr> {
    const bb = await BarretenbergSync.new()
    return bb.poseidonHash([a, b])
}
