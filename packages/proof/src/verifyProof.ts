import { groth16 } from "snarkjs"
import { FullProof } from "./types"
import verificationKeys from "./verificationKeys.json"

/**
 * Verifies a SnarkJS proof.
 * @param fullProof The SnarkJS full proof.
 * @param treeDepth The Merkle tree depth.
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyProof({ proof, publicSignals }: FullProof, treeDepth: number): Promise<boolean> {
    if (treeDepth < 16 || treeDepth > 32) {
        throw new TypeError("The tree depth must be a number between 16 and 32")
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[treeDepth - 16],
        IC: verificationKeys.IC[treeDepth - 16]
    }

    return groth16.verify(
        verificationKey,
        [
            publicSignals.merkleRoot,
            publicSignals.nullifierHash,
            publicSignals.signalHash,
            publicSignals.externalNullifier
        ],
        proof
    )
}
