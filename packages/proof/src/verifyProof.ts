import { Noir } from "@noir-lang/noir_js"
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg"
import { SemaphoreProof } from "./types"
import compiled from "../artifacts/16.json"

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The Merkle tree depth.
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyProof({ proof }: SemaphoreProof, treeDepth: number): Promise<boolean> {
    if (treeDepth !== 16) {
        throw new TypeError("Currently only depth 16 is supported")
    }

    if (!compiled) {
        throw new Error("Failed to read circuit artifact")
    }

    // @ts-ignore
    const backend = new BarretenbergBackend(compiled)
    // @ts-ignore
    const noir = new Noir(compiled, backend)

    return noir.verifyFinalProof(proof)
}
