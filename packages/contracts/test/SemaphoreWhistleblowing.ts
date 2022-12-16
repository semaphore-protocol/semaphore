/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof, packToSolidityProof, PublicSignals, SolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { Signer, utils } from "ethers"
import { ethers, run } from "hardhat"
import { SemaphoreWhistleblowing } from "../build/typechain"

describe("SemaphoreWhistleblowing", () => {
    let contract: SemaphoreWhistleblowing
    let accounts: Signer[]
    let editor: string

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const entityIds = [1, 2]

    const wasmFilePath = `../../snark-artifacts/${treeDepth}/semaphore.wasm`
    const zkeyFilePath = `../../snark-artifacts/${treeDepth}/semaphore.zkey`

    before(async () => {
        contract = await run("deploy:semaphore-whistleblowing", {
            logs: false
        })

        accounts = await ethers.getSigners()
        editor = await accounts[1].getAddress()
    })

    describe("# createEntity", () => {
        it("Should not create an entity with a wrong depth", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, 10)

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeDepthIsNotSupported()")
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
            const group = new Group(entityIds[0], treeDepth)

            group.addMember(commitment)

            const transaction = contract.connect(accounts[1]).addWhistleblower(entityIds[0], commitment)

            await expect(transaction).to.emit(contract, "MemberAdded").withArgs(entityIds[0], 0, commitment, group.root)
        })

        it("Should return the correct number of whistleblowers of an entity", async () => {
            const size = await contract.getNumberOfMerkleTreeLeaves(entityIds[0])

            expect(size).to.be.eq(1)
        })
    })

    describe("# removeWhistleblower", () => {
        it("Should not remove a whistleblower if the caller is not the editor", async () => {
            const { commitment } = new Identity()
            const group = new Group(entityIds[0], treeDepth)

            group.addMember(commitment)

            const { siblings, pathIndices } = group.generateMerkleProof(0)

            const transaction = contract.removeWhistleblower(entityIds[0], commitment, siblings, pathIndices)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheEditor()")
        })

        it("Should remove a whistleblower from an existing entity", async () => {
            const { commitment } = new Identity("test")
            const group = new Group(entityIds[0], treeDepth)

            group.addMember(commitment)

            const { siblings, pathIndices } = group.generateMerkleProof(0)

            group.removeMember(0)

            const transaction = contract
                .connect(accounts[1])
                .removeWhistleblower(entityIds[0], commitment, siblings, pathIndices)

            await expect(transaction)
                .to.emit(contract, "MemberRemoved")
                .withArgs(entityIds[0], 0, commitment, group.root)
        })
    })

    describe("# publishLeak", () => {
        const identity = new Identity("test")
        const leak = utils.formatBytes32String("This is a leak")

        const group = new Group(entityIds[1], treeDepth)

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

        it("Should not publish a leak if the proof is not valid", async () => {
            const transaction = contract.connect(accounts[1]).publishLeak(leak, 0, entityIds[1], solidityProof)

            await expect(transaction).to.be.revertedWith("Semaphore__InvalidProof()")
        })

        it("Should publish a leak", async () => {
            const transaction = contract
                .connect(accounts[1])
                .publishLeak(leak, publicSignals.nullifierHash, entityIds[1], solidityProof)

            await expect(transaction).to.emit(contract, "LeakPublished").withArgs(entityIds[1], leak)
        })
    })
})
