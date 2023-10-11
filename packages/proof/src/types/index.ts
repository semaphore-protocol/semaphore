import type { NumericString } from "snarkjs"

export type SnarkArtifacts = {
    wasmFilePath: string
    zkeyFilePath: string
}

export type SemaphoreProof = {
    merkleTreeRoot: NumericString
    signal: NumericString
    nullifierHash: NumericString
    externalNullifier: NumericString
    proof: PackedProof
}

export type PackedProof = [
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString
]
