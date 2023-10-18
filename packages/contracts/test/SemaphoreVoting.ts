/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { SemaphoreProof, generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, run } from "hardhat"
import { Pairing, SemaphoreVoting } from "../build/typechain"

describe("SemaphoreVoting", () => {
    let semaphoreVotingContract: SemaphoreVoting
    let pairingContract: Pairing
    let accounts: Signer[]
    let coordinator: string

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const pollIds = [1, 2, 3]
    const encryptionKey = BigInt(0)
    const decryptionKey = BigInt(0)

    const wasmFilePath = `../../snark-artifacts/${treeDepth}/semaphore.wasm`
    const zkeyFilePath = `../../snark-artifacts/${treeDepth}/semaphore.zkey`

    before(async () => {
        const { semaphoreVoting, pairingAddress } = await run("deploy:semaphore-voting", {
            logs: false
        })

        semaphoreVotingContract = semaphoreVoting
        pairingContract = await ethers.getContractAt("Pairing", pairingAddress)

        accounts = await ethers.getSigners()
        coordinator = await accounts[1].getAddress()
    })

    describe("# createPoll", () => {
        it("Should not create a poll with a wrong depth", async () => {
            const transaction = semaphoreVotingContract.createPoll(pollIds[0], coordinator, 10)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__MerkleTreeDepthIsNotSupported"
            )
        })

        it("Should create a poll", async () => {
            const transaction = semaphoreVotingContract.createPoll(pollIds[0], coordinator, treeDepth)

            await expect(transaction).to.emit(semaphoreVotingContract, "PollCreated").withArgs(pollIds[0], coordinator)
        })

        it("Should not create a poll if it already exists", async () => {
            const transaction = semaphoreVotingContract.createPoll(pollIds[0], coordinator, treeDepth)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__GroupAlreadyExists"
            )
        })
    })

    describe("# startPoll", () => {
        it("Should not start the poll if the caller is not the coordinator", async () => {
            const transaction = semaphoreVotingContract.startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__CallerIsNotThePollCoordinator"
            )
        })

        it("Should start the poll", async () => {
            const transaction = semaphoreVotingContract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction)
                .to.emit(semaphoreVotingContract, "PollStarted")
                .withArgs(pollIds[0], coordinator, encryptionKey)
        })

        it("Should not start a poll if it has already been started", async () => {
            const transaction = semaphoreVotingContract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__PollHasAlreadyBeenStarted"
            )
        })
    })

    describe("# addVoter", () => {
        before(async () => {
            await semaphoreVotingContract.createPoll(pollIds[1], coordinator, treeDepth)
        })

        it("Should not add a voter if the caller is not the coordinator", async () => {
            const { commitment } = new Identity()

            const transaction = semaphoreVotingContract.addVoter(pollIds[0], commitment)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__CallerIsNotThePollCoordinator"
            )
        })

        it("Should not add a voter if the poll has already been started", async () => {
            const { commitment } = new Identity()

            const transaction = semaphoreVotingContract.connect(accounts[1]).addVoter(pollIds[0], commitment)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__PollHasAlreadyBeenStarted"
            )
        })

        it("Should add a voter to an existing poll", async () => {
            const { commitment } = new Identity("test")
            const group = new Group(pollIds[1], treeDepth)

            group.addMember(commitment)

            const transaction = semaphoreVotingContract.connect(accounts[1]).addVoter(pollIds[1], commitment)

            await expect(transaction)
                .to.emit(semaphoreVotingContract, "MemberAdded")
                .withArgs(pollIds[1], 0, commitment, group.root)
        })

        it("Should return the correct number of poll voters", async () => {
            const size = await semaphoreVotingContract.getNumberOfMerkleTreeLeaves(pollIds[1])

            expect(size).to.be.eq(1)
        })
    })

    describe("# castVote", () => {
        const identity = new Identity("test")
        const vote = 1

        const group = new Group(pollIds[1], treeDepth)

        group.addMembers([identity.commitment, BigInt(1)])

        let fullProof: SemaphoreProof

        before(async () => {
            await semaphoreVotingContract.connect(accounts[1]).addVoter(pollIds[1], BigInt(1))
            await semaphoreVotingContract.connect(accounts[1]).startPoll(pollIds[1], encryptionKey)
            await semaphoreVotingContract.createPoll(pollIds[2], coordinator, treeDepth)

            fullProof = await generateProof(identity, group, pollIds[1], vote, {
                wasmFilePath,
                zkeyFilePath
            })
        })

        it("Should not cast a vote if the poll is not ongoing", async () => {
            const transaction = semaphoreVotingContract
                .connect(accounts[1])
                .castVote(vote, fullProof.nullifierHash, pollIds[2], fullProof.proof)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__PollIsNotOngoing"
            )
        })

        it("Should not cast a vote if the proof is not valid", async () => {
            const transaction = semaphoreVotingContract
                .connect(accounts[1])
                .castVote(vote, 0, pollIds[1], fullProof.proof)

            await expect(transaction).to.be.revertedWithCustomError(pairingContract, "InvalidProof")
        })

        it("Should cast a vote", async () => {
            const transaction = semaphoreVotingContract
                .connect(accounts[1])
                .castVote(vote, fullProof.nullifierHash, pollIds[1], fullProof.proof)

            await expect(transaction).to.emit(semaphoreVotingContract, "VoteAdded").withArgs(pollIds[1], vote)
        })

        it("Should not cast a vote twice", async () => {
            const transaction = semaphoreVotingContract
                .connect(accounts[1])
                .castVote(vote, fullProof.nullifierHash, pollIds[1], fullProof.proof)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__YouAreUsingTheSameNillifierTwice"
            )
        })
    })

    describe("# endPoll", () => {
        it("Should not end the poll if the caller is not the coordinator", async () => {
            const transaction = semaphoreVotingContract.endPoll(pollIds[1], decryptionKey)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__CallerIsNotThePollCoordinator"
            )
        })

        it("Should end the poll", async () => {
            const transaction = semaphoreVotingContract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction)
                .to.emit(semaphoreVotingContract, "PollEnded")
                .withArgs(pollIds[1], coordinator, decryptionKey)
        })

        it("Should not end a poll if it has already been ended", async () => {
            const transaction = semaphoreVotingContract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreVotingContract,
                "Semaphore__PollIsNotOngoing"
            )
        })
    })
})
