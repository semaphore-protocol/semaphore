import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import generateProof from "./generateProof"
import { SemaphoreProof } from "./types"
import verifyProof from "./verifyProof"

describe("Proof", () => {
    const groupId = 0
    const treeDepth = 16

    const externalNullifier = BigInt(1)
    const signal = BigInt(2)

    const identity = new Identity()

    let fullProof: SemaphoreProof

    describe("# generateProof", () => {
        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group(treeDepth, 16, [BigInt(1), BigInt(2)])

            const fun = () =>
                generateProof(identity, group, externalNullifier, signal)

            await expect(fun).rejects.toThrow("The identity is not part of the group")
        })

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(groupId, treeDepth, [identity.commitment])

            fullProof = await generateProof(identity, group, externalNullifier, signal)

            expect(typeof fullProof).toBe("object")
            expect(fullProof.merkleTreeRoot).toBe(group.root)
        }, 200_000)

        it("Should generate a Semaphore proof passing a Merkle proof as parameter", async () => {
            const group = new Group(0, treeDepth, [identity.commitment])

            fullProof = await generateProof(identity, group.generateMerkleProof(0), externalNullifier, signal)

            expect(typeof fullProof).toBe("object")
            expect(fullProof.merkleTreeRoot).toBe(group.root)
        }, 200_000)
    })

    describe("# verifyProof", () => {
        it("Should not verify a proof if the tree depth is wrong", () => {
            const fun = () => verifyProof(fullProof, 3)

            expect(fun).toThrow("Currently only depth 16 is supported")
        })

        it("Should verify a Semaphore proof", async () => {
            const response = await verifyProof(fullProof, treeDepth)

            expect(response).toBe(true)
        }, 200_000)
    })
})
