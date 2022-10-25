/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import {
    generateNullifierHash,
    generateProof,
    packToSolidityProof,
    PublicSignals,
    SolidityProof
} from "@semaphore-protocol/proof"
import { expect } from "chai"
import { Signer, utils } from "ethers"
import { ethers, run } from "hardhat"
import { SemaphoreWhistleblowing } from "../build/typechain"

describe("SemaphoreWhistleblowing", () => {
    let contract: SemaphoreWhistleblowing
    let accounts: Signer[]
    let editor: string

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const entityIds = [BigInt(1), BigInt(2)]

    const wasmFilePath = `../../snark-artifacts/semaphore.wasm`
    const zkeyFilePath = `../../snark-artifacts/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth: treeDepth })
        contract = await run("deploy:semaphore-whistleblowing", {
            logs: false,
            verifiers: [{ merkleTreeDepth: treeDepth, contractAddress: verifierAddress }]
        })

        accounts = await ethers.getSigners()
        editor = await accounts[1].getAddress()
    })

    describe("# createEntity", () => {
        it("Should not create an entity with a wrong depth", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, 10)

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeDepthIsNotSupported()")
        })

        it("Should not create an entity greater than the snark scalar field", async () => {
            const transaction = contract.createEntity(
                BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495618"),
                editor,
                treeDepth
            )

            await expect(transaction).to.be.revertedWith("Semaphore__GroupIdIsNotLessThanSnarkScalarField()")
        })

        it("Should create an entity", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, treeDepth)

            await expect(transaction).to.emit(contract, "EntityCreated").withArgs(entityIds[0], editor)
        })

        it("Should not create a entity if it already exists", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, treeDepth)

            await expect(transaction).to.be.revertedWith("Semaphore__GroupAlreadyExists()")
        })
    })

    describe("# addWhistleblower", () => {
        it("Should not add a whistleblower if the caller is not the editor", async () => {
            const { commitment } = new Identity()

            const transaction = contract.addWhistleblower(entityIds[0], commitment)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheEditor()")
        })

        it("Should add a whistleblower to an existing entity", async () => {
            const { commitment } = new Identity("test")

            const transaction = contract.connect(accounts[1]).addWhistleblower(entityIds[0], commitment)

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    entityIds[0],
                    0,
                    commitment,
                    "14787813191318312920980352979830075893203307366494541177071234930769373297362"
                )
        })

        it("Should return the correct number of whistleblowers of an entity", async () => {
            const size = await contract.getNumberOfMerkleTreeLeaves(entityIds[0])

            expect(size).to.be.eq(1)
        })
    })

    describe("# removeWhistleblower", () => {
        it("Should not remove a whistleblower if the caller is not the editor", async () => {
            const { commitment } = new Identity()
            const group = new Group(treeDepth)

            group.addMember(commitment)

            const { siblings, pathIndices } = group.generateProofOfMembership(0)

            const transaction = contract.removeWhistleblower(entityIds[0], commitment, siblings, pathIndices)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheEditor()")
        })

        it("Should remove a whistleblower from an existing entity", async () => {
            const { commitment } = new Identity("test")
            const group = new Group(treeDepth)

            group.addMember(commitment)

            const { siblings, pathIndices } = group.generateProofOfMembership(0)

            const transaction = contract
                .connect(accounts[1])
                .removeWhistleblower(entityIds[0], commitment, siblings, pathIndices)

            await expect(transaction)
                .to.emit(contract, "MemberRemoved")
                .withArgs(
                    entityIds[0],
                    0,
                    commitment,
                    "15019797232609675441998260052101280400536945603062888308240081994073687793470"
                )
        })
    })

    describe("# publishLeak", () => {
        const identity = new Identity("test")
        const leak = "leak"
        const bytes32Leak = utils.formatBytes32String(leak)

        const group = new Group(treeDepth)

        group.addMembers([identity.commitment, BigInt(1)])

        let solidityProof: SolidityProof
        let publicSignals: PublicSignals

        before(async () => {
            await contract.createEntity(entityIds[1], editor, treeDepth)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], identity.commitment)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], BigInt(1))

            const fullProof = await generateProof(identity, group, entityIds[1], leak, {
                wasmFilePath,
                zkeyFilePath
            })

            publicSignals = fullProof.publicSignals
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not publish a leak if the caller is not the editor", async () => {
            const transaction = contract.publishLeak(
                bytes32Leak,
                publicSignals.nullifierHash,
                entityIds[0],
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheEditor()")
        })

        it("Should not publish a leak if the proof is not valid", async () => {
            const nullifierHash = generateNullifierHash(entityIds[0], identity.getNullifier())

            const transaction = contract
                .connect(accounts[1])
                .publishLeak(bytes32Leak, nullifierHash, entityIds[1], solidityProof)

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should publish a leak", async () => {
            const transaction = contract
                .connect(accounts[1])
                .publishLeak(bytes32Leak, publicSignals.nullifierHash, entityIds[1], solidityProof)

            await expect(transaction).to.emit(contract, "LeakPublished").withArgs(entityIds[1], bytes32Leak)
        })
    })
})
