import { BytesLike, Hexable } from "@ethersproject/bytes"
import { poseidon2 } from "poseidon-lite"
import hash from "./hash"

/**
 * Given the identity nullifier and the external nullifier, it calculates nullifier hash.
 * @param identityNullifier The identity nullifier.
 * @param externalNullifier The external nullifier.
 * @returns The nullifier hash.
 */
export default function calculateNullifierHash(
    identityNullifier: number | bigint | string,
    externalNullifier: BytesLike | Hexable | number | bigint
): bigint {
    return poseidon2([hash(externalNullifier), identityNullifier])
}
