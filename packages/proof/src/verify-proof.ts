import { verify } from "@zk-kit/groth16"
import { SemaphoreProof } from "./types"
import unpackProof from "./unpack-proof"
import verificationKeys from "./verification-keys.json"
import hash from "./hash"

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The depth of the tree.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof(
    { merkleRoot, nullifier, message, scope, proof }: SemaphoreProof,
    treeDepth: number
): Promise<boolean> {
    // TODO: support all tree depths after trusted-setup.
    if (treeDepth < 1 || treeDepth > 12) {
        throw new TypeError("The tree depth must be a number between 1 and 12")
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[treeDepth - 1],
        IC: verificationKeys.IC[treeDepth - 1]
    }

    return verify(verificationKey, {
        publicSignals: [merkleRoot, nullifier, hash(message), hash(scope)],
        proof: unpackProof(proof)
    })
}
