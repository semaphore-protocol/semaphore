import type { Group } from "@semaphore-protocol/core"
import { Circomkit } from "circomkit"
import { readFileSync } from "fs"
import path from "path"

const configFilePath = path.join(__dirname, "../circomkit.json")
const config = JSON.parse(readFileSync(configFilePath, "utf-8"))

export const circomkit = new Circomkit({
    ...config,
    verbose: false
})

export function generateMerkleProof(group: Group, _index: number, maxDepth: number) {
    const { siblings: merkleProofSiblings, index: merkleProofIndex } = group.generateMerkleProof(_index)

    // For example, if the circuit expects a Merkle tree of depth 20,
    // the input must always include 20 sibling nodes, even if the actual
    // tree depth is smaller (e.g., 3). The unused sibling positions can be
    // filled with 0, as they won't affect the root calculation in the circuit.

    for (let i = 0; i < maxDepth; i += 1) {
        if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = BigInt(0)
        }
    }

    return { merkleProofSiblings, merkleProofIndex }
}
