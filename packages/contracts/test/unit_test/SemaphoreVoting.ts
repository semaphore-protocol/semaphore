import { expect } from "chai"
import { run } from "hardhat"
import { SemaphoreVoting } from "contracts/build/typechain"
import { Signer, utils } from "ethers"
import { config } from "../../package.json"

import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import {
  generateNullifierHash,
  generateProof,
  packToSolidityProof,
  PublicSignals,
  SolidityProof
} from "@webb-tools/semaphore-proof"
import { VerifierContractInfo, createRootsBytes } from "../utils"

describe("SemaphoreVoting", () => {
  let contract: SemaphoreVoting
  let signers: Signer[]
  let coordinator: string

  const chainID = BigInt(1099511629113)
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const pollIds = [BigInt(1), BigInt(2), BigInt(3)]
  const encryptionKey = BigInt(0)
  const decryptionKey = BigInt(0)
  const maxEdges = 1

  const wasmFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/semaphore_20_2.wasm`
  const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/circuit_final.zkey`

  before(async () => {
    const { address: v2_address } = await run("deploy:verifier", {
      logs: false,
      depth: treeDepth,
      maxEdges: 2
    })
    const VerifierV2: VerifierContractInfo = {
      name: `Verifier${treeDepth}_${2}`,
      address: v2_address,
      depth: `${treeDepth}`,
      circuitLength: `2`
    }

    const { address: v7_address } = await run("deploy:verifier", {
      logs: false,
      depth: treeDepth,
      maxEdges: 7
    })
    const VerifierV7: VerifierContractInfo = {
      name: `Verifier${treeDepth}_${7}`,
      address: v7_address,
      depth: `${treeDepth}`,
      circuitLength: `7`
    }

    const deployedVerifiers: Map<string, VerifierContractInfo> = new Map([
      ["v2", VerifierV2],
      ["v7", VerifierV7]
    ])

    const verifierSelector = await run("deploy:verifier-selector", {
      logs: false,
      verifiers: deployedVerifiers
    })
    contract = await run("deploy:semaphore-voting", {
      logs: false,
      verifier: verifierSelector.address
    })
    signers = await run("accounts", { logs: false })
    coordinator = await signers[1].getAddress()
  })

  describe("# createPoll", () => {
    it("Should not create a poll with a wrong depth", async () => {
      const transaction = contract.createPoll(
        pollIds[0],
        10,
        coordinator,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: depth value is not supported"
      )
    })

    it("Should not create a poll greater than the snark scalar field", async () => {
      const transaction = contract.createPoll(
        BigInt(
          "21888242871839275222246405745257275088548364400416034343698204186575808495618"
        ),
        treeDepth,
        coordinator,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__GroupIdIsNotLessThanSnarkScalarField()"
      )
    })

    it("Should create a poll", async () => {
      const transaction = contract.createPoll(
        pollIds[0],
        treeDepth,
        coordinator,
        maxEdges
      )

      await expect(transaction)
        .to.emit(contract, "PollCreated")
        .withArgs(pollIds[0], coordinator)
    })

    it("Should not create a poll if it already exists", async () => {
      const transaction = contract.createPoll(
        pollIds[0],
        treeDepth,
        coordinator,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__GroupAlreadyExists()"
      )
    })
  })

  describe("# startPoll", () => {
    it("Should not start the poll if the caller is not the coordinator", async () => {
      const transaction = contract.startPoll(pollIds[0], encryptionKey)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: caller is not the poll coordinator"
      )
    })

    it("Should start the poll", async () => {
      const transaction = contract
        .connect(signers[1])
        .startPoll(pollIds[0], encryptionKey)

      await expect(transaction)
        .to.emit(contract, "PollStarted")
        .withArgs(pollIds[0], coordinator, encryptionKey)
    })

    it("Should not start a poll if it has already been started", async () => {
      const transaction = contract
        .connect(signers[1])
        .startPoll(pollIds[0], encryptionKey)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: poll has already been started"
      )
    })
  })

  describe("# addVoter", () => {
    before(async () => {
      await contract.createPoll(pollIds[1], treeDepth, coordinator, maxEdges)
    })

    it("Should not add a voter if the caller is not the coordinator", async () => {
      const identity = new Identity(chainID)
      const identityCommitment = identity.generateCommitment()

      const transaction = contract.addVoter(pollIds[0], identityCommitment)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: caller is not the poll coordinator"
      )
    })

    it("Should not add a voter if the poll has already been started", async () => {
      const identity = new Identity(chainID)
      const identityCommitment = identity.generateCommitment()

      const transaction = contract
        .connect(signers[1])
        .addVoter(pollIds[0], identityCommitment)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: voters can only be added before voting"
      )
    })

    it("Should add a voter to an existing poll", async () => {
      const identity = new Identity("test")
      const identityCommitment = identity.generateCommitment()

      const group = new LinkedGroup(treeDepth, maxEdges)
      group.addMember(identityCommitment)

      const transaction = contract
        .connect(signers[1])
        .addVoter(pollIds[1], identityCommitment)

      await expect(transaction).to.emit(contract, "MemberAdded").withArgs(
        pollIds[1],
        identityCommitment,
        group.root
        // "7943806797233700547041913393384710769504872928213070894800658208056456315893"
      )
    })

    it("Should return the correct number of poll voters", async () => {
      const size = await contract.getNumberOfLeaves(pollIds[1])

      expect(size).to.be.eq(1)
    })
  })

  describe("# castVote", () => {
    const identity = new Identity("test")
    const identityCommitment = identity.generateCommitment()
    const vote = "1"
    const bytes32Vote = utils.formatBytes32String(vote)

    const group = new LinkedGroup(treeDepth, maxEdges)

    group.addMember(identityCommitment)
    group.addMember(BigInt(1))

    let solidityProof: SolidityProof
    let publicSignals: PublicSignals

    before(async () => {
      await contract.connect(signers[1]).addVoter(pollIds[1], BigInt(1))
      await contract.connect(signers[1]).startPoll(pollIds[1], encryptionKey)
      await contract.createPoll(pollIds[2], treeDepth, coordinator, maxEdges)

      const fullProof = await generateProof(
        identity,
        group,
        BigInt(pollIds[1]),
        vote,
        chainID,
        {
          wasmFilePath,
          zkeyFilePath
        }
      )

      publicSignals = fullProof.publicSignals
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should not cast a vote if the caller is not the coordinator", async () => {
      const transaction = contract.castVote(
        bytes32Vote,
        publicSignals.nullifierHash,
        pollIds[0],
        createRootsBytes(publicSignals.roots),
        solidityProof
      )

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: caller is not the poll coordinator"
      )
    })

    it("Should not cast a vote if the poll is not ongoing", async () => {
      const transaction = contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          publicSignals.nullifierHash,
          pollIds[2],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: vote can only be cast in an ongoing poll"
      )
    })

    it("Should not cast a vote if the proof is not valid", async () => {
      const nullifierHash = generateNullifierHash(
        pollIds[0],
        identity.getNullifier()
      )

      const transaction = contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          nullifierHash,
          pollIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).to.be.revertedWith("invalidProof")
    })

    it("Should cast a vote", async () => {
      const transaction = contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          publicSignals.nullifierHash,
          pollIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction)
        .to.emit(contract, "VoteAdded")
        .withArgs(pollIds[1], bytes32Vote)
    })

    it("Should not cast a vote twice", async () => {
      const transaction = contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          publicSignals.nullifierHash,
          pollIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).to.be.revertedWith(
        "You are using same nullifier twice"
      )
    })
  })

  describe("# endPoll", () => {
    it("Should not end the poll if the caller is not the coordinator", async () => {
      const transaction = contract.endPoll(pollIds[1], decryptionKey)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: caller is not the poll coordinator"
      )
    })

    it("Should end the poll", async () => {
      const transaction = contract
        .connect(signers[1])
        .endPoll(pollIds[1], encryptionKey)

      await expect(transaction)
        .to.emit(contract, "PollEnded")
        .withArgs(pollIds[1], coordinator, decryptionKey)
    })

    it("Should not end a poll if it has already been ended", async () => {
      const transaction = contract
        .connect(signers[1])
        .endPoll(pollIds[1], encryptionKey)

      await expect(transaction).to.be.revertedWith(
        "SemaphoreVoting: poll is not ongoing"
      )
    })
  })
})
