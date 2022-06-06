import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { Semaphore, SemaphorePublicSignals, SemaphoreSolidityProof } from "@zk-kit/protocols"
import { expect } from "chai"
import { Signer, utils } from "ethers"
import { ethers, run } from "hardhat"
import { SemaphoreWhistleblowing } from "../build/typechain"
import { createMerkleProof } from "./utils"
import { config } from "../package.json"

describe("SemaphoreWhistleblowing", () => {
    let contract: SemaphoreWhistleblowing
    let accounts: Signer[]
    let editor: string

    const depth = Number(process.env.TREE_DEPTH)
    const entityIds = [BigInt(1), BigInt(2)]

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth })
        contract = await run("deploy:semaphore-whistleblowing", { logs: false, verifier: verifierAddress })
        accounts = await ethers.getSigners()
        editor = await accounts[1].getAddress()
    })

    describe("# createEntity", () => {
        it("Should not create an entity with a wrong depth", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, 10)

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: depth value is not supported")
        })

        it("Should not create an entity greater than the snark scalar field", async () => {
            const transaction = contract.createEntity(
                BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495618"),
                editor,
                depth
            )

            await expect(transaction).to.be.revertedWith("SemaphoreGroups: group id must be < SNARK_SCALAR_FIELD")
        })

        it("Should create an entity", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, depth)

            await expect(transaction).to.emit(contract, "EntityCreated").withArgs(entityIds[0], editor)
        })

        it("Should not create a entity if it already exists", async () => {
            const transaction = contract.createEntity(entityIds[0], editor, depth)

            await expect(transaction).to.be.revertedWith("SemaphoreGroups: group already exists")
        })
    })

    describe("# addWhistleblower", () => {
        it("Should not add a whistleblower if the caller is not the editor", async () => {
            const identity = new ZkIdentity()
            const identityCommitment = identity.genIdentityCommitment()

            const transaction = contract.addWhistleblower(entityIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should add a whistleblower to an existing entity", async () => {
            const identity = new ZkIdentity(Strategy.MESSAGE, "test")
            const identityCommitment = identity.genIdentityCommitment()

            const transaction = contract.connect(accounts[1]).addWhistleblower(entityIds[0], identityCommitment)

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    entityIds[0],
                    identityCommitment,
                    "14787813191318312920980352979830075893203307366494541177071234930769373297362"
                )
        })

        it("Should return the correct number of whistleblowers of an entity", async () => {
            const size = await contract.getNumberOfLeaves(entityIds[0])

            expect(size).to.be.eq(1)
        })
    })

    describe("# removeWhistleblower", () => {
        it("Should not remove a whistleblower if the caller is not the editor", async () => {
            const identity = new ZkIdentity()
            const identityCommitment = identity.genIdentityCommitment()
            const { siblings, pathIndices } = createMerkleProof([identityCommitment], identityCommitment)

            const transaction = contract.removeWhistleblower(entityIds[0], identityCommitment, siblings, pathIndices)

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should remove a whistleblower from an existing entity", async () => {
            const identity = new ZkIdentity(Strategy.MESSAGE, "test")
            const identityCommitment = identity.genIdentityCommitment()
            const { siblings, pathIndices } = createMerkleProof([identityCommitment], identityCommitment)

            const transaction = contract
                .connect(accounts[1])
                .removeWhistleblower(entityIds[0], identityCommitment, siblings, pathIndices)

            await expect(transaction)
                .to.emit(contract, "MemberRemoved")
                .withArgs(
                    entityIds[0],
                    identityCommitment,
                    "15019797232609675441998260052101280400536945603062888308240081994073687793470"
                )
        })
    })

    describe("# publishLeak", () => {
        const identity = new ZkIdentity(Strategy.MESSAGE, "test")
        const identityCommitment = identity.genIdentityCommitment()
        const merkleProof = createMerkleProof([identityCommitment, BigInt(1)], identityCommitment)
        const leak = "leak"
        const bytes32Leak = utils.formatBytes32String(leak)

        const witness = Semaphore.genWitness(
            identity.getTrapdoor(),
            identity.getNullifier(),
            merkleProof,
            entityIds[1],
            leak
        )

        let solidityProof: SemaphoreSolidityProof
        let publicSignals: SemaphorePublicSignals

        before(async () => {
            await contract.createEntity(entityIds[1], editor, depth)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], identityCommitment)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], BigInt(1))

            const fullProof = await Semaphore.genProof(witness, wasmFilePath, zkeyFilePath)

            publicSignals = fullProof.publicSignals
            solidityProof = Semaphore.packToSolidityProof(fullProof.proof)
        })

        it("Should not publish a leak if the caller is not the editor", async () => {
            const transaction = contract.publishLeak(
                bytes32Leak,
                publicSignals.nullifierHash,
                entityIds[0],
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should not publish a leak if the proof is not valid", async () => {
            const nullifierHash = Semaphore.genNullifierHash(entityIds[0], identity.getNullifier())

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
