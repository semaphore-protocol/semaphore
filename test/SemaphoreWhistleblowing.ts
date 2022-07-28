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
import { config } from "../package.json"

describe("SemaphoreWhistleblowing", () => {
    let contract: SemaphoreWhistleblowing
    let accounts: Signer[]
    let editor: string

    const treeDepth = Number(process.env.TREE_DEPTH)
    const entityIds = [BigInt(1), BigInt(2)]

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth: treeDepth })
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
            const identity = new Identity()
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.addWhistleblower(entityIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should add a whistleblower to an existing entity", async () => {
            const identity = new Identity("test")
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.connect(accounts[1]).addWhistleblower(entityIds[0], identityCommitment)
            const zero = "21663839004416932945382355908790599225266501822907911457504978515578255421292"
            const group = new Group(treeDepth, BigInt(zero))
            group.addMember(identityCommitment)

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    entityIds[0],
                    identityCommitment,
                    // TODO: Double check if root is actually supposed to be different
                    // prev_root:
                    // "14787813191318312920980352979830075893203307366494541177071234930769373297362"
                    // curr_root:
                    group.root
                    // "5519721975282040051140289013432901508280068291271190928090711912059677088196"
                )
        })

        it("Should return the correct number of whistleblowers of an entity", async () => {
            const size = await contract.getNumberOfLeaves(entityIds[0])

            expect(size).to.be.eq(1)
        })
    })

    describe("# removeWhistleblower", () => {
        it("Should not remove a whistleblower if the caller is not the editor", async () => {
            const identity = new Identity()
            const identityCommitment = identity.generateCommitment()
            const group = new Group(treeDepth)

            group.addMember(identityCommitment)

            const { siblings, pathIndices } = group.generateProofOfMembership(0)

            const transaction = contract.removeWhistleblower(entityIds[0], identityCommitment, siblings, pathIndices)

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should remove a whistleblower from an existing entity", async () => {
            const identity = new Identity("test")
            const identityCommitment = identity.generateCommitment()
            const zero = "21663839004416932945382355908790599225266501822907911457504978515578255421292"
            const group = new Group(treeDepth, BigInt(zero))
            // const group = new Group(treeDepth)

            group.addMember(identityCommitment)

            const { siblings, pathIndices } = group.generateProofOfMembership(0)

            group.removeMember(0)

            const transaction = contract
                .connect(accounts[1])
                .removeWhistleblower(entityIds[0], identityCommitment, siblings, pathIndices)

            await expect(transaction)
                .to.emit(contract, "MemberRemoved")
                .withArgs(
                    entityIds[0],
                    identityCommitment,
                    // TODO: Double check if root is actually supposed to be different
                    // prev_root:
                    // "15019797232609675441998260052101280400536945603062888308240081994073687793470"
                    // curr_root:
                    group.root
                )
        })
    })

    describe("# publishLeak", () => {
        const identity = new Identity("test")
        const identityCommitment = identity.generateCommitment()
        const leak = "leak"
        const bytes32Leak = utils.formatBytes32String(leak)

        const group = new Group(treeDepth)

        group.addMembers([identityCommitment, BigInt(1)])

        let solidityProof: SolidityProof
        let publicSignals: PublicSignals

        before(async () => {
            await contract.createEntity(entityIds[1], editor, treeDepth)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], identityCommitment)
            await contract.connect(accounts[1]).addWhistleblower(entityIds[1], BigInt(1))

            const fullProof = await generateProof(identity, group, entityIds[1], leak, {
                wasmFilePath,
                zkeyFilePath
            })

            publicSignals = fullProof.publicSignals
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not publish a leak if the caller is not the editor", async () => {
            const roots = await contract.getRoot(entityIds[0]);
            const transaction = contract.publishLeak(
                bytes32Leak,
                publicSignals.nullifierHash,
                entityIds[0],
                roots.toHexString(),
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
        })

        it("Should not publish a leak if the proof is not valid", async () => {
            const nullifierHash = generateNullifierHash(entityIds[0], identity.getNullifier())
            const roots = await contract.getRoot(entityIds[1]);
            const transaction = contract
                .connect(accounts[1])
                .publishLeak(
                    bytes32Leak,
                    nullifierHash,
                    entityIds[1],
                    roots.toHexString(),
                    solidityProof
                )

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should publish a leak", async () => {
            const roots = await contract.getRoot(entityIds[1]);
            const transaction = contract
                .connect(accounts[1])
                .publishLeak(
                    bytes32Leak,
                    publicSignals.nullifierHash,
                    entityIds[1],
                    roots.toHexString(),
                    solidityProof
                )

            await expect(transaction).to.emit(contract, "LeakPublished").withArgs(entityIds[1], bytes32Leak)
        })
    })
})
