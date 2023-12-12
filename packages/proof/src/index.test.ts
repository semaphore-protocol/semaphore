import { formatBytes32String } from "@ethersproject/strings"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import generateProof from "./generate-proof"
import hash from "./hash"
import packProof from "./pack-proof"
import { SemaphoreProof } from "./types"
import unpackProof from "./unpack-proof"
import verifyProof from "./verify-proof"

describe("Proof", () => {
    const treeDepth = 10

    const scope = formatBytes32String("Scope")
    const message = formatBytes32String("Hello world")

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

            const fun = () => generateProof(identity, group, scope, message, treeDepth)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should generate a Semaphore proof", async () => {
            const group = new Group([BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group, scope, message, treeDepth)

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

    describe("# hash", () => {
        it("Should hash the message correctly", async () => {
            const messageHash = hash(message)

            expect(messageHash).toBe("8665846418922331996225934941481656421248110469944536651334918563951783029")
        })

        it("Should hash the scope correctly", async () => {
            const scopeHash = hash(scope)

            expect(scopeHash).toBe("170164770795872309789133717676167925425155944778337387941930839678899666300")
        })

        it("Should hash a number", async () => {
            expect(hash(2)).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386")
        })

        it("Should hash a big number", async () => {
            expect(hash(BigInt(2))).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386")
        })

        it("Should hash an hex number", async () => {
            expect(hash("0x2")).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386")
        })

        it("Should hash an string number", async () => {
            expect(hash("2")).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386")
        })

        it("Should hash an array", async () => {
            expect(hash([2])).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386")
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
