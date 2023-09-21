import { Groth16Proof } from "snarkjs"
import { PackedProof } from "./types"

/**
 * Packs a proof into a format compatible with Semaphore.
 * @param proof The Groth16 proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
export default function packProof(proof: Groth16Proof): PackedProof {
    return [
        proof.pi_a[0],
        proof.pi_a[1],
        proof.pi_b[0][1],
        proof.pi_b[0][0],
        proof.pi_b[1][1],
        proof.pi_b[1][0],
        proof.pi_c[0],
        proof.pi_c[1]
    ]
}
