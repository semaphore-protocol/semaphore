import type { NumericString } from "snarkjs"
import type { PackedGroth16Proof } from "@zk-kit/utils"

export type GenerateProofOptions = {
    /**
     * Whether to generate the proof on a single thread. This is useful in runtimes
     * such as Bun, browser extensions and SES environments where workers are unavailable.
     * @default false
     */
    singleThread?: boolean
}

export type SemaphoreProof = {
    merkleTreeDepth: number
    merkleTreeRoot: NumericString
    message: NumericString
    nullifier: NumericString
    scope: NumericString
    points: PackedGroth16Proof
}
