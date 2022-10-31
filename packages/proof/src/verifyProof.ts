import { groth16 } from "snarkjs"
import { FullProof } from "./types"

/**
 * Verifies a SnarkJS proof.
 * @param verificationKey The zero-knowledge verification key.
 * @param fullProof The SnarkJS full proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyProof(
  verificationKey: any,
  { proof, publicSignals }: FullProof
): Promise<boolean> {
  const publicParams = [
    publicSignals.nullifierHash,
    publicSignals.signalHash,
    publicSignals.externalNullifier
  ]
  for (const root of publicSignals.roots) {
    publicParams.push(root)
  }
  publicParams.push(publicSignals.chainID)

  return groth16.verify(verificationKey, publicParams, proof)
}
