import { ProofData } from "@noir-lang/noir_js"
import type { NumericString } from "snarkjs"

export type SemaphoreProof = {
    merkleTreeRoot: NumericString
    signal: NumericString
    nullifierHash: NumericString
    externalNullifier: NumericString
    proof: ProofData
}
