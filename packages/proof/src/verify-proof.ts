import { verify } from "@zk-kit/groth16"
import hash from "./hash"
import { SemaphoreProof } from "./types"
import unpackPoints from "./unpack-proof"
import verificationKeys from "./verification-keys.json"

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The depth of the tree.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof({
    merkleTreeDepth,
    merkleTreeRoot,
    nullifier,
    message,
    scope,
    points
}: SemaphoreProof): Promise<boolean> {
    // TODO: support all tree depths after trusted-setup.
    if (merkleTreeDepth < 1 || merkleTreeDepth > 12) {
        throw new TypeError("The tree depth must be a number between 1 and 12")
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[merkleTreeDepth - 1],
        IC: verificationKeys.IC[merkleTreeDepth - 1]
    }

    return verify(verificationKey, {
        publicSignals: [merkleTreeRoot, nullifier, hash(message), hash(scope)],
        proof: unpackPoints(points)
    })
}
