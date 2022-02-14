import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { Semaphore } from "@zk-kit/protocols"
import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, run } from "hardhat"
import { SemaphoreVoting } from "../build/typechain"
import { createMerkleProof } from "./utils"

describe("SemaphoreVoting", () => {
  let contract: SemaphoreVoting
  let accounts: Signer[]
  let coordinator: string

  const pollIds = [BigInt(1), BigInt(2), BigInt(3)]
  const encryptionKey = BigInt(0)
  const decryptionKey = BigInt(0)

  before(async () => {
    contract = await run("deploy:semaphore-voting", { logs: false })
    accounts = await ethers.getSigners()
    coordinator = await accounts[1].getAddress()
  })

  describe("# createPoll", () => {
    it("Should create a poll", async () => {
      const transaction = contract.createPoll(pollIds[0], coordinator)

      await expect(transaction).to.emit(contract, "PollCreated").withArgs(pollIds[0], coordinator)
    })

    it("Should not create a poll if it already exists", async () => {
      const transaction = contract.createPoll(pollIds[0], coordinator)

      await expect(transaction).to.be.revertedWith("SemaphoreGroups: group already exists")
    })
  })

  describe("# startPoll", () => {
    it("Should not start the poll if the caller is not the coordinator", async () => {
      const transaction = contract.startPoll(pollIds[0], encryptionKey)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
    })

    it("Should start the poll", async () => {
      const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

      await expect(transaction).to.emit(contract, "PollStarted").withArgs(pollIds[0], coordinator, encryptionKey)
    })

    it("Should not start a poll if it has already been started", async () => {
      const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: poll has already been started")
    })
  })

  describe("# addVoter", () => {
    before(async () => {
      await contract.createPoll(pollIds[1], coordinator)
    })

    it("Should not add a voter if the caller is not the coordinator", async () => {
      const identity = new ZkIdentity()
      const identityCommitment = identity.genIdentityCommitment()

      const transaction = contract.addVoter(pollIds[0], identityCommitment)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
    })

    it("Should not add a voter if the poll has already been started", async () => {
      const identity = new ZkIdentity()
      const identityCommitment = identity.genIdentityCommitment()

      const transaction = contract.connect(accounts[1]).addVoter(pollIds[0], identityCommitment)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: voters can only be added before voting")
    })

    it("Should add a voter to an existing poll", async () => {
      const identity = new ZkIdentity(Strategy.MESSAGE, "test")
      const identityCommitment = identity.genIdentityCommitment()

      const transaction = contract.connect(accounts[1]).addVoter(pollIds[1], identityCommitment)

      await expect(transaction)
        .to.emit(contract, "MemberAdded")
        .withArgs(
          pollIds[1],
          identityCommitment,
          "21535114724992190095497080437889044838904308549109546660414808669273607403748"
        )
    })

    it("Should return the correct number of poll voters", async () => {
      const size = await contract.getSize(pollIds[1])

      expect(size).to.be.eq(1)
    })
  })

  describe("# castVote", () => {
    const wasmFilePath = "./build/snark/semaphore.wasm"
    const finalZkeyPath = "./build/snark/semaphore_final.zkey"

    const identity = new ZkIdentity(Strategy.MESSAGE, "test")
    const identityCommitment = identity.genIdentityCommitment()
    const merkleProof = createMerkleProof([identityCommitment, BigInt(1)], identityCommitment)
    const vote = "1"

    before(async () => {
      await contract.connect(accounts[1]).addVoter(pollIds[1], BigInt(1))
      await contract.connect(accounts[1]).startPoll(pollIds[1], encryptionKey)
      await contract.createPoll(pollIds[2], coordinator)
    })

    it("Should not cast a vote if the caller is not the coordinator", async () => {
      const nullifierHash = Semaphore.genNullifierHash(pollIds[0], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        pollIds[0],
        vote
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.castVote(vote, nullifierHash, pollIds[0], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
    })

    it("Should not cast a vote if the poll is not ongoing", async () => {
      const nullifierHash = Semaphore.genNullifierHash(pollIds[2], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        pollIds[2],
        vote
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).castVote(vote, nullifierHash, pollIds[2], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: vote can only be cast in an ongoing poll")
    })

    it("Should not cast a vote if the proof is not valid", async () => {
      const nullifierHash = Semaphore.genNullifierHash(pollIds[1], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        pollIds[2],
        vote
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).castVote(vote, nullifierHash, pollIds[1], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: the proof is not valid")
    })

    it("Should cast a vote", async () => {
      const nullifierHash = Semaphore.genNullifierHash(pollIds[1], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        pollIds[1],
        vote
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).castVote(vote, nullifierHash, pollIds[1], solidityProof)

      await expect(transaction).to.emit(contract, "VoteAdded").withArgs(pollIds[1], vote)
    })

    it("Should not cast a vote twice", async () => {
      const nullifierHash = Semaphore.genNullifierHash(pollIds[1], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        pollIds[1],
        vote
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).castVote(vote, nullifierHash, pollIds[1], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreCore: you cannot use the same nullifier twice")
    })
  })

  describe("# endPoll", () => {
    it("Should not end the poll if the caller is not the coordinator", async () => {
      const transaction = contract.endPoll(pollIds[1], decryptionKey)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
    })

    it("Should end the poll", async () => {
      const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

      await expect(transaction).to.emit(contract, "PollEnded").withArgs(pollIds[1], coordinator, decryptionKey)
    })

    it("Should not end a poll if it has already been ended", async () => {
      const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

      await expect(transaction).to.be.revertedWith("SemaphoreVoting: poll is not ongoing")
    })
  })
})
