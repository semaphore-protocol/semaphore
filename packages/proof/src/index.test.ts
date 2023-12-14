import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import generateProof from "./generate-proof"
import packProof from "./pack-proof"
import { SemaphoreProof } from "./types"
import unpackProof from "./unpack-proof"
import verifyProof from "./verify-proof"

describe("Proof", () => {
    const treeDepth = 10

    const message = 1
    const scope = 2

    const identity = new Identity(42)

    let fullProof: SemaphoreProof
    let curve: any

    beforeAll(async () => {
        curve = await getCurveFromName("bn128")
    })

    afterAll(async () => {
        await curve.terminate()
    })

    describe("# generateProof", () => {
        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group([BigInt(1), BigInt(2)])

            const fun = () => generateProof(identity, group, message, scope, treeDepth)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should generate a Semaphore proof", async () => {
            const group = new Group([BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group, message, scope, treeDepth)

            expect(typeof fullProof).toBe("object")
            expect(fullProof.treeRoot).toBe(group.root)
        })
    })

    describe("# verifyProof", () => {
        it("Should verify a Semaphore proof", async () => {
            const response = await verifyProof(fullProof)

            expect(response).toBe(true)
        })
    })

    describe("# packProof/unpackProof", () => {
        it("Should return a packed proof", async () => {
            const originalProof = unpackProof(fullProof.proof)
            const proof = packProof(originalProof)

            expect(proof).toStrictEqual(fullProof.proof)
        })
    })
})
