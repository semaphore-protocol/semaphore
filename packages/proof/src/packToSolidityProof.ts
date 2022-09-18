import { Proof, SolidityProof } from "./types"

/**
 * Makes a proof compatible with the Verifier.sol method inputs.
 * @param proof The proof generated with SnarkJS.
 * @returns The Solidity compatible proof.
 */
export default function packToSolidityProof(proof: Proof): SolidityProof {
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
