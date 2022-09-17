/* eslint-disable jest/valid-expect */
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
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
import { SemaphoreVoting } from "../build/typechain"
import { config } from "../package.json"

describe("SemaphoreVoting", () => {
    let contract: SemaphoreVoting
    let accounts: Signer[]
    let coordinator: string

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const pollIds = [BigInt(1), BigInt(2), BigInt(3)]
    const encryptionKey = BigInt(0)
    const decryptionKey = BigInt(0)

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth: treeDepth })
        contract = await run("deploy:semaphore-voting", {
            logs: false,
            verifiers: [{ merkleTreeDepth: treeDepth, contractAddress: verifierAddress }]
        })

        accounts = await ethers.getSigners()
        coordinator = await accounts[1].getAddress()
    })

    describe("# createPoll", () => {
        it("Should not create a poll with a wrong depth", async () => {
            const transaction = contract.createPoll(pollIds[0], coordinator, 10)

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeDepthIsNotSupported()")
        })

        it("Should not create a poll greater than the snark scalar field", async () => {
            const transaction = contract.createPoll(
                BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495618"),
                coordinator,
                treeDepth
            )

            await expect(transaction).to.be.revertedWith("Semaphore__GroupIdIsNotLessThanSnarkScalarField()")
        })

        it("Should create a poll", async () => {
            const transaction = contract.createPoll(pollIds[0], coordinator, treeDepth)

            await expect(transaction).to.emit(contract, "PollCreated").withArgs(pollIds[0], coordinator)
        })

        it("Should not create a poll if it already exists", async () => {
            const transaction = contract.createPoll(pollIds[0], coordinator, treeDepth)

            await expect(transaction).to.be.revertedWith("Semaphore__GroupAlreadyExists()")
        })
    })

    describe("# startPoll", () => {
        it("Should not start the poll if the caller is not the coordinator", async () => {
            const transaction = contract.startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotThePollCoordinator()")
        })

        it("Should start the poll", async () => {
            const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.emit(contract, "PollStarted").withArgs(pollIds[0], coordinator, encryptionKey)
        })

        it("Should not start a poll if it has already been started", async () => {
            const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWith("Semaphore__PollHasAlreadyBeenStarted()")
        })
    })

    describe("# addVoter", () => {
        before(async () => {
            await contract.createPoll(pollIds[1], coordinator, treeDepth)
        })

        it("Should not add a voter if the caller is not the coordinator", async () => {
            const identity = new Identity()
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.addVoter(pollIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotThePollCoordinator()")
        })

        it("Should not add a voter if the poll has already been started", async () => {
            const identity = new Identity()
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.connect(accounts[1]).addVoter(pollIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("Semaphore__PollHasAlreadyBeenStarted()")
        })

        it("Should add a voter to an existing poll", async () => {
            const identity = new Identity("test")
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.connect(accounts[1]).addVoter(pollIds[1], identityCommitment)

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    pollIds[1],
                    0,
                    identityCommitment,
                    "14787813191318312920980352979830075893203307366494541177071234930769373297362"
                )
        })

        it("Should return the correct number of poll voters", async () => {
            const size = await contract.getNumberOfMerkleTreeLeaves(pollIds[1])

            expect(size).to.be.eq(1)
        })
    })

    describe("# castVote", () => {
        const identity = new Identity("test")
        const identityCommitment = identity.generateCommitment()
        const vote = "1"
        const bytes32Vote = utils.formatBytes32String(vote)

        const group = new Group(treeDepth)

        group.addMembers([identityCommitment, BigInt(1)])

        let solidityProof: SolidityProof
        let publicSignals: PublicSignals

        before(async () => {
            await contract.connect(accounts[1]).addVoter(pollIds[1], BigInt(1))
            await contract.connect(accounts[1]).startPoll(pollIds[1], encryptionKey)
            await contract.createPoll(pollIds[2], coordinator, treeDepth)

            const fullProof = await generateProof(identity, group, pollIds[1], vote, {
                wasmFilePath,
                zkeyFilePath
            })

            publicSignals = fullProof.publicSignals
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not cast a vote if the caller is not the coordinator", async () => {
            const transaction = contract.castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[0], solidityProof)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotThePollCoordinator()")
        })

        it("Should not cast a vote if the poll is not ongoing", async () => {
            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[2], solidityProof)

            await expect(transaction).to.be.revertedWith("Semaphore__PollIsNotOngoing()")
        })

        it("Should not cast a vote if the proof is not valid", async () => {
            const nullifierHash = generateNullifierHash(pollIds[0], identity.getNullifier())

            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, nullifierHash, pollIds[1], solidityProof)

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should cast a vote", async () => {
            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[1], solidityProof)

            await expect(transaction).to.emit(contract, "VoteAdded").withArgs(pollIds[1], bytes32Vote)
        })

        it("Should not cast a vote twice", async () => {
            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[1], solidityProof)

            await expect(transaction).to.be.revertedWith("Semaphore__YouAreUsingTheSameNillifierTwice()")
        })
    })

    describe("# endPoll", () => {
        it("Should not end the poll if the caller is not the coordinator", async () => {
            const transaction = contract.endPoll(pollIds[1], decryptionKey)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotThePollCoordinator()")
        })

        it("Should end the poll", async () => {
            const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction).to.emit(contract, "PollEnded").withArgs(pollIds[1], coordinator, decryptionKey)
        })

        it("Should not end a poll if it has already been ended", async () => {
            const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction).to.be.revertedWith("Semaphore__PollIsNotOngoing()")
        })
    })
})
