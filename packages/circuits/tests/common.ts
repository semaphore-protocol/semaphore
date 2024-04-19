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
    const { siblings: merkleProofSiblings, index } = group.generateMerkleProof(_index)

    // The index must be converted to a list of indices, 1 for each tree level.
    // The circuit tree depth is 20, so the number of siblings must be 20, even if
    // the tree depth is actually 3. The missing siblings can be set to 0, as they
    // won't be used to calculate the root in the circuit.
    const merkleProofIndices: number[] = []

    for (let i = 0; i < maxDepth; i += 1) {
        merkleProofIndices.push((index >> i) & 1)

        if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = BigInt(0)
        }
    }

    return { merkleProofSiblings, merkleProofIndices }
}
