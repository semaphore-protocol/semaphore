import { Groth16Proof } from "@zk-kit/groth16"
import { PackedPoints } from "./types"

/**
 * Packs the Groth16 proof points into a format compatible with Semaphore.
 * @param proof The proof points generated with SnarkJS.
 * @returns The proof points compatible with Semaphore.
 */
export default function packPoints(proof: Groth16Proof): PackedPoints {
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
