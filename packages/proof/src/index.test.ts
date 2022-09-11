import { Group } from "@semaphore-anchor/group/src"
import { Identity } from "@semaphore-anchor/identity/src"
import { BigNumber, BigNumberish } from 'ethers';
import download from "download"
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
    const chainID = BigInt(1099511629113)

    const snarkArtifactsPath = "./packages/proof/snark-artifacts"
    const wasmFilePath = `${snarkArtifactsPath}/semaphore_20_2.wasm`;
    const zkeyFilePath = `${snarkArtifactsPath}/circuit_final.zkey`;

    const identity = new Identity(chainID)
    const identityCommitment = identity.generateCommitment()

    let fullProof: FullProof

    beforeAll(async () => {

        if (!fs.existsSync(snarkArtifactsPath)) {
            fs.mkdirSync(snarkArtifactsPath)
        }
    }, 10000)

    describe("# generateProof", () => {
        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2)])

            const fun = () =>
                generateProof(identity, group, [group.root], externalNullifier, signal, chainID, {
                    wasmFilePath: wasmFilePath,
                    zkeyFilePath: zkeyFilePath
                })

            await expect(fun).rejects.toThrow("The identity is not part of the group")
        })

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identityCommitment])

            fullProof = await generateProof(identity, group, [group.root], externalNullifier, signal, chainID, {
                    wasmFilePath: wasmFilePath,
                    zkeyFilePath: zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
        }, 20000)

        it("Should generate a Semaphore proof passing a Merkle proof as parametr", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identityCommitment])

            fullProof = await generateProof(identity, group, [group.root], externalNullifier, signal, chainID, {
                    wasmFilePath: wasmFilePath,
                    zkeyFilePath: zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
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
