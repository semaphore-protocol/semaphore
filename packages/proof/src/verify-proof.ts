import {
    requireArray,
    requireDefined,
    requireNumber,
    requireObject,
    requireString
} from "@semaphore-protocol/utils/errors"
import { MIN_DEPTH, MAX_DEPTH } from "@semaphore-protocol/utils/constants"
import { groth16 } from "snarkjs"
import { unpackGroth16Proof } from "@zk-kit/utils/proof-packing"
import hash from "./hash"
import { SemaphoreProof } from "./types"
import verificationKeys from "./verification-keys.json"

/**
 * Verifies whether a Semaphore proof is valid. Depending on the depth of the tree used to
 * generate the proof, a different verification key will be used.
 * @param proof The Semaphore proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof(proof: SemaphoreProof): Promise<boolean> {
    requireDefined(proof, "proof")
    requireObject(proof, "proof")

    const { merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points } = proof

    requireNumber(merkleTreeDepth, "proof.merkleTreeDepth")
    requireString(merkleTreeRoot, "proof.merkleTreeRoot")
    requireString(nullifier, "proof.nullifier")
    requireString(message, "proof.message")
    requireString(scope, "proof.scope")
    requireArray(points, "proof.points")

    // TODO: support all tree depths after trusted-setup.
    if (merkleTreeDepth < MIN_DEPTH || merkleTreeDepth > MAX_DEPTH) {
        throw new TypeError(`The tree depth must be a number between ${MIN_DEPTH} and ${MAX_DEPTH}`)
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[merkleTreeDepth - 1],
        IC: verificationKeys.IC[merkleTreeDepth - 1]
    }

    return groth16.verify(
        verificationKey,
        [merkleTreeRoot, nullifier, hash(message), hash(scope)],
        unpackGroth16Proof(points)
    )
}
