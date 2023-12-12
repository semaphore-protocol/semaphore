import { verify } from "@zk-kit/groth16"
import hash from "./hash"
import { SemaphoreProof } from "./types"
import unpackProof from "./unpack-proof"
import verificationKeys from "./verification-keys.json"

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyProof({ treeRoot, nullifier, scope, message, proof }: SemaphoreProof): Promise<boolean> {
    // TODO: support all tree depths after trusted-setup.
    // if (treeDepth < 1 || treeDepth > 32) {
    // throw new TypeError("The tree depth must be a number between 1 and 32")
    // }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[0],
        IC: verificationKeys.IC[0]
    }

    return verify(verificationKey, {
        publicSignals: [treeRoot, nullifier, hash(message), hash(scope)],
        proof: unpackProof(proof)
    })
}
