import { Group, Identity } from "@semaphore-protocol/core"
import { Base8, mulPointEscalar } from "@zk-kit/baby-jubjub"
import { WitnessTester } from "circomkit"
import { poseidon2 } from "poseidon-lite"
import { circomkit, generateMerkleProof } from "./common"

// Prime number of 251 bits.
const l = 2736030358979909402780800718157159386076813972158567259200215660948447373041n

// Prime finite field.
const r = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

describe("semaphore", () => {
    let circuit: WitnessTester<
        ["secret", "merkleProofLength", "merkleProofIndex", "merkleProofSiblings", "scope", "message"],
        ["nullifier", "merkleRoot"]
    >

    const MAX_DEPTH = 20

    const scope = 32
    const message = 43

    before(async () => {
        circuit = await circomkit.WitnessTester("semaphore", {
            file: "semaphore",
            template: "Semaphore",
            params: [MAX_DEPTH]
        })
    })

    it("Should calculate the root and the nullifier correctly", async () => {
        const secret = l - 1n

        const commitment = poseidon2(mulPointEscalar(Base8, secret))

        const group = new Group([commitment, 2n, 3n])

        const { merkleProofSiblings, merkleProofIndex } = generateMerkleProof(group, 0, MAX_DEPTH)

        const INPUT = {
            secret,
            merkleProofLength: group.depth,
            merkleProofIndex,
            merkleProofSiblings,
            scope,
            message
        }

        const OUTPUT = {
            nullifier: poseidon2([scope, secret]),
            merkleRoot: group.root
        }

        await circuit.expectPass(INPUT, OUTPUT)
    })

    it("Should not calculate the root and the nullifier correctly if secret > l", async () => {
        const secret = l

        const commitment = poseidon2(mulPointEscalar(Base8, secret))
        const group = new Group([commitment, 2n, 3n])

        const { merkleProofSiblings, merkleProofIndex } = generateMerkleProof(group, 0, MAX_DEPTH)

        const INPUT = {
            secret,
            merkleProofLength: group.depth,
            merkleProofIndex,
            merkleProofSiblings,
            scope,
            message
        }

        await circuit.expectFail(INPUT)
    })

    it("Should not calculate the root and the nullifier correctly if secret = r - 1", async () => {
        const secret = r - 1n

        const commitment = poseidon2(mulPointEscalar(Base8, secret))
        const group = new Group([commitment, 2n, 3n])

        const { merkleProofSiblings, merkleProofIndex } = generateMerkleProof(group, 0, MAX_DEPTH)

        const INPUT = {
            secret,
            merkleProofLength: group.depth,
            merkleProofIndex,
            merkleProofSiblings,
            scope,
            message
        }

        await circuit.expectFail(INPUT)
    })

    it("Should calculate the root and the nullifier correctly using the Semaphore Identity library", async () => {
        const { commitment, secretScalar: secret } = new Identity()

        const group = new Group([commitment, 2n, 3n])

        const { merkleProofSiblings, merkleProofIndex } = generateMerkleProof(group, 0, MAX_DEPTH)

        const INPUT = {
            secret,
            merkleProofLength: group.depth,
            merkleProofIndex,
            merkleProofSiblings,
            scope,
            message
        }

        const OUTPUT = {
            nullifier: poseidon2([scope, secret]),
            merkleRoot: group.root
        }

        await circuit.expectPass(INPUT, OUTPUT)
    })
})
