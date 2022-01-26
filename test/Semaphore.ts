import { ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, genExternalNullifier, genSignalHash, Semaphore } from "@zk-kit/protocols"
import { expect } from "chai"
import { poseidon_gencontract as poseidonGenContract } from "circomlibjs"
import { readFileSync } from "fs"
import { ethers } from "hardhat"
import { join } from "path"

function deployPoseidonTx(x: number) {
    return ethers.getContractFactory(poseidonGenContract.generateABI(x), poseidonGenContract.createCode(x))
}

describe("Semaphore", () => {
    let semaphore: any
    let defaultExternalNullifier: any
    let newExternalNullifier: any

    const identityCommitments: bigint[] = []
    const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(["bytes"], [ethers.utils.toUtf8Bytes("Semaphore")]))

    before(async () => {
        defaultExternalNullifier = genExternalNullifier("voting_1")
        newExternalNullifier = genExternalNullifier("voting-2")

        const PoseidonT3 = await deployPoseidonTx(2)
        const poseidonT3 = await PoseidonT3.deploy()
        await poseidonT3.deployed()

        const PoseidonT6 = await deployPoseidonTx(5)
        const poseidonT6 = await PoseidonT6.deploy()
        await poseidonT6.deployed()

        const Semaphore = await ethers.getContractFactory("Semaphore", {
            libraries: {
                PoseidonT3: poseidonT3.address,
                PoseidonT6: poseidonT6.address
            }
        })

        semaphore = await Semaphore.deploy(20, defaultExternalNullifier)

        await semaphore.deployed()

        const leafIndex = 3

        for (let i = 0; i < leafIndex; i++) {
            const tmpIdentity = new ZkIdentity()
            const tmpCommitment = tmpIdentity.genIdentityCommitment()

            identityCommitments.push(tmpCommitment)

            await semaphore.insertIdentity(tmpCommitment)
        }
    })

    describe("Proof", () => {
        it("Should generate full semaphore proof", async () => {
            const identity = new ZkIdentity()
            const identityCommitment = identity.genIdentityCommitment()

            await semaphore.insertIdentity(identityCommitment)

            const signal = "0x111"
            const nullifierHash = Semaphore.genNullifierHash(defaultExternalNullifier, identity.getNullifier())

            const commitments = Object.assign([], identityCommitments)
            commitments.push(identityCommitment)

            const merkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
            const witness = Semaphore.genWitness(
                identity.getTrapdoor(),
                identity.getNullifier(),
                merkleProof,
                defaultExternalNullifier,
                signal
            )

            const wasmFilePath = join("./build/snark/semaphore_js", "semaphore.wasm")
            const finalZkeyPath = join("./build/snark", "semaphore_final.zkey")

            const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
            const solidityProof = Semaphore.packToSolidityProof(fullProof)

            const packedProof = await semaphore.packProof(solidityProof.a, solidityProof.b, solidityProof.c)

            const preBroadcastCheck = await semaphore.preBroadcastCheck(
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
                packedProof,
                merkleProof.root,
                nullifierHash,
                genSignalHash(signal),
                defaultExternalNullifier
            )

            expect(preBroadcastCheck).to.be.true

            const response = await semaphore.broadcastSignal(
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
                packedProof,
                merkleProof.root,
                nullifierHash,
                defaultExternalNullifier
            )

            expect(response).to.not.equal(null)
        })
    })

    describe("ExternalNullifier", () => {
        it("Default nullifier should be active", async () => {
            const isActive = await semaphore.isExternalNullifierActive(defaultExternalNullifier)
            expect(isActive).to.be.true
        })
        it("ExternalNullifier should be active after add", async () => {
            await semaphore.addExternalNullifier(newExternalNullifier)
            const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier)
            expect(isActive).to.be.true
        })
        it("ExternalNullifier should not be active after deactivation", async () => {
            await semaphore.deactivateExternalNullifier(newExternalNullifier)
            const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier)
            expect(isActive).to.be.false
        })
        it("ExternalNullifier should be active after reactivation", async () => {
            await semaphore.reactivateExternalNullifier(newExternalNullifier)
            const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier)
            expect(isActive).to.be.true
        })
        it("Non owner should not be able to add nullifier", async () => {
            const [_, addr1] = await ethers.getSigners()

            const newNullifier = genExternalNullifier("voting-3")
            await expect(semaphore.connect(addr1).addExternalNullifier(newNullifier)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })
        it("Non owner should be able to add nullifier after setPermissioning", async () => {
            await semaphore.setPermissioning(true)
            const newNullifier = genExternalNullifier("voting-3")
            await semaphore.addExternalNullifier(newNullifier)
            const isActive = await semaphore.isExternalNullifierActive(newNullifier)
            expect(isActive).to.be.true
        })
        it("Should fail to add already existing nullifier", async () => {
            await expect(semaphore.addExternalNullifier(newExternalNullifier)).to.be.revertedWith(
                "Semaphore: external nullifier already set"
            )
        })
        it("Should return newExternalNullifier as next nullifier", async () => {
            const nextNullifier = await semaphore.getNextExternalNullifier(defaultExternalNullifier)
            expect(nextNullifier).to.be.equal(newExternalNullifier)
        })
    })
})
