import type { NumericString } from "snarkjs"
import { ProofData } from "@noir-lang/noir_js"

export type BigNumberish = string | number | bigint

export type SnarkArtifacts = {
    wasmFilePath: string
    zkeyFilePath: string
}

export type SemaphoreProof = {
    proof: ProofData
}

export type PackedPoints = [
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString
]
