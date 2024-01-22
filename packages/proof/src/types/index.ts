import type { NumericString } from "@zk-kit/groth16"

export type BigNumberish = string | number | bigint

export type SnarkArtifacts = {
    wasmFilePath: string
    zkeyFilePath: string
}

export type SemaphoreProof = {
    merkleTreeDepth: number
    merkleTreeRoot: NumericString
    message: NumericString
    nullifier: NumericString
    scope: NumericString
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
