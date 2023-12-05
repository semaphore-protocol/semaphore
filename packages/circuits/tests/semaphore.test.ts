import { derivePublicKey, deriveSecretScalar } from "@zk-kit/eddsa-poseidon"
import { LeanIMT } from "@zk-kit/imt"
import { WitnessTester } from "circomkit"
import { poseidon2 } from "poseidon-lite"
import { circomkit } from "./common"

describe("semaphore", () => {
    let circuit: WitnessTester<
        ["privateKey", "treeDepth", "treeIndices", "treeSiblings", "scope", "message"],
        ["nullifier", "treeRoot"]
    >

    const MAX_DEPTH = 20

    const scope = 32
    const message = 43

    const privateKey = 1
    const publicKey = derivePublicKey(privateKey)

    const leaf = poseidon2(publicKey)

    const tree = new LeanIMT((a, b) => poseidon2([a, b]))

    tree.insert(leaf)

    for (let i = 1; i < 4; i += 1) {
        tree.insert(BigInt(i))
    }

    const { siblings: treeSiblings, index } = tree.generateProof(0)

    // The index must be converted to a list of indices, 1 for each tree level.
    // The circuit tree depth is 20, so the number of siblings must be 20, even if
    // the tree depth is actually 3. The missing siblings can be set to 0, as they
    // won't be used to calculate the root in the circuit.
    const treeIndices: number[] = []

    for (let i = 0; i < MAX_DEPTH; i += 1) {
        treeIndices.push((index >> i) & 1)

        if (treeSiblings[i] === undefined) {
            treeSiblings[i] = BigInt(0)
        }
    }

    const INPUT = {
        privateKey: deriveSecretScalar(privateKey),
        treeDepth: tree.depth,
        treeIndices,
        treeSiblings,
        scope,
        message
    }

    const OUTPUT = {
        nullifier: poseidon2([scope, deriveSecretScalar(privateKey)]),
        treeRoot: tree.root
    }

    before(async () => {
        circuit = await circomkit.WitnessTester("semaphore", {
            file: "semaphore",
            template: "Semaphore",
            params: [MAX_DEPTH]
        })
    })

    it("Should calculate the root and the nullifier correctly", async () => {
        await circuit.expectPass(INPUT, OUTPUT)
    })
})
