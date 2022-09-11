import { poseidon } from "circomlibjs"
import { BigNumberish } from "./types"

/**
 * Generates a nullifier by hashing the external and the identity nullifiers.
 * @param externalNullifier The external nullifier.
 * @param identityNullifier The identity nullifier.
 * @returns The nullifier hash.
 */
export default function generateNullifierHash(
    externalNullifier: BigNumberish,
    identityNullifier: BigNumberish,
): bigint {
    return poseidon([BigInt(externalNullifier), BigInt(identityNullifier)])
}
