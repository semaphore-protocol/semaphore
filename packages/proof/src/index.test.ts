import { formatBytes32String } from "@ethersproject/strings"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import calculateNullifierHash from "./calculateNullifierHash"
import generateProof from "./generateProof"
import hash from "./hash"
import packProof from "./packProof"
import { SemaphoreProof } from "./types"
import unpackProof from "./unpackProof"
import verifyProof from "./verifyProof"

describe("Proof", () => {
    const treeDepth = Number(process.env.TREE_DEPTH) || 20

    const externalNullifier = formatBytes32String("Topic")
    const signal = formatBytes32String("Hello world")

    const wasmFilePath = `./snark-artifacts/${treeDepth}/semaphore.wasm`
    const zkeyFilePath = `./snark-artifacts/${treeDepth}/semaphore.zkey`

    const identity = new Identity()

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
            const group = new Group(treeDepth, 20, [BigInt(1), BigInt(2)])

            const fun = () =>
                generateProof(identity, group, externalNullifier, signal, {
                    wasmFilePath,
                    zkeyFilePath
                })

            await expect(fun).rejects.toThrow("The identity is not part of the group")
        })

        it("Should not generate a Semaphore proof with default snark artifacts with Node.js", async () => {
            const group = new Group(treeDepth, 20, [BigInt(1), BigInt(2), identity.commitment])

            const fun = () => generateProof(identity, group, externalNullifier, signal)

            await expect(fun).rejects.toThrow("ENOENT: no such file or directory")
        })

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(treeDepth, 20, [BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group, externalNullifier, signal, {
                wasmFilePath,
                zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.merkleTreeRoot).toBe(group.root.toString())
        }, 20000)

        it("Should generate a Semaphore proof passing a Merkle proof as parameter", async () => {
            const group = new Group(treeDepth, 20, [BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group.generateMerkleProof(2), externalNullifier, signal, {
                wasmFilePath,
                zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.merkleTreeRoot).toBe(group.root.toString())
        }, 20000)
    })

    describe("# verifyProof", () => {
        it("Should not verify a proof if the tree depth is wrong", () => {
            const fun = () => verifyProof(fullProof, 3)

            expect(fun).toThrow("The tree depth must be a number between 16 and 32")
        })

        it("Should verify a Semaphore proof", async () => {
            const response = await verifyProof(fullProof, treeDepth)

            expect(response).toBe(true)
        })
    })

    describe("# hash", () => {
        it("Should hash the signal value correctly", async () => {
            const signalHash = hash(signal)

            expect(signalHash).toBe("8665846418922331996225934941481656421248110469944536651334918563951783029")
        })

        it("Should hash the external nullifier value correctly", async () => {
            const externalNullifierHash = hash(externalNullifier)

            expect(externalNullifierHash).toBe(
                "244178201824278269437519042830883072613014992408751798420801126401127326826"
            )
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

    describe("# calculateNullifierHash", () => {
        it("Should calculate the nullifier hash correctly", async () => {
            const nullifierHash = calculateNullifierHash(identity.nullifier, externalNullifier)

            expect(fullProof.nullifierHash).toBe(nullifierHash.toString())
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
