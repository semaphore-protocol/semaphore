import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import download from "download"
import { getCurveFromName } from "ffjavascript"
import fs from "fs"
import generateNullifierHash from "./generateNullifierHash"
import generateProof from "./generateProof"
import generateSignalHash from "./generateSignalHash"
import packToSolidityProof from "./packToSolidityProof"
import { FullProof } from "./types"
import verifyProof from "./verifyProof"

describe("Proof", () => {
    const treeDepth = 20

    const externalNullifier = "1"
    const signal = "0x111"

    const snarkArtifactsPath = "./packages/proof/snark-artifacts"
    const snarkArtifactsUrl = `http://www.trusted-setup-pse.org/semaphore/${treeDepth}`

    const identity = new Identity()
    const identityCommitment = identity.generateCommitment()

    let fullProof: FullProof
    let curve: any

    beforeAll(async () => {
        curve = await getCurveFromName("bn128")

        if (!fs.existsSync(snarkArtifactsPath)) {
            fs.mkdirSync(snarkArtifactsPath)
        }

        if (!fs.existsSync(`${snarkArtifactsPath}/semaphore.zkey`)) {
            await download(`${snarkArtifactsUrl}/semaphore.wasm`, snarkArtifactsPath)
            await download(`${snarkArtifactsUrl}/semaphore.zkey`, snarkArtifactsPath)
            await download(`${snarkArtifactsUrl}/semaphore.json`, snarkArtifactsPath)
        }
    }, 10000)

    afterAll(async () => {
        await curve.terminate()
    })

    describe("# generateProof", () => {
        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2)])

            const fun = () =>
                generateProof(identity, group, externalNullifier, signal, {
                    wasmFilePath: `${snarkArtifactsPath}/semaphore.wasm`,
                    zkeyFilePath: `${snarkArtifactsPath}/semaphore.zkey`
                })

            await expect(fun).rejects.toThrow("The identity is not part of the group")
        })

        it("Should not generate a Semaphore proof with default snark artifacts with Node.js", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identityCommitment])

            const fun = () => generateProof(identity, group, externalNullifier, signal)

            await expect(fun).rejects.toThrow("ENOENT: no such file or directory")
        })

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identityCommitment])

            fullProof = await generateProof(identity, group, externalNullifier, signal, {
                wasmFilePath: `${snarkArtifactsPath}/semaphore.wasm`,
                zkeyFilePath: `${snarkArtifactsPath}/semaphore.zkey`
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
            expect(fullProof.publicSignals.merkleRoot).toBe(group.root.toString())
        }, 20000)

        it("Should generate a Semaphore proof passing a Merkle proof as parametr", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identityCommitment])

            fullProof = await generateProof(identity, group.generateProofOfMembership(2), externalNullifier, signal, {
                wasmFilePath: `${snarkArtifactsPath}/semaphore.wasm`,
                zkeyFilePath: `${snarkArtifactsPath}/semaphore.zkey`
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
            expect(fullProof.publicSignals.merkleRoot).toBe(group.root.toString())
        }, 20000)
    })

    describe("# generateSignalHash", () => {
        it("Should generate a valid signal hash", async () => {
            const signalHash = generateSignalHash(signal)

            expect(signalHash.toString()).toBe(fullProof.publicSignals.signalHash)
        })
    })

    describe("# generateNullifierHash", () => {
        it("Should generate a valid nullifier hash", async () => {
            const nullifierHash = generateNullifierHash(externalNullifier, identity.getNullifier())

            expect(nullifierHash.toString()).toBe(fullProof.publicSignals.nullifierHash)
        })
    })

    describe("# packToSolidityProof", () => {
        it("Should return a Solidity proof", async () => {
            const solidityProof = packToSolidityProof(fullProof.proof)

            expect(solidityProof).toHaveLength(8)
        })
    })

    describe("# verifyProof", () => {
        it("Should generate and verify a Semaphore proof", async () => {
            const verificationKey = JSON.parse(fs.readFileSync(`${snarkArtifactsPath}/semaphore.json`, "utf-8"))

            const response = await verifyProof(verificationKey, fullProof)

            expect(response).toBe(true)
        })
    })
})
