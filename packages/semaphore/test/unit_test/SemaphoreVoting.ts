import { expect } from "chai"
import { run } from "hardhat"
import { Signer, utils } from "ethers"
import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import {
  generateNullifierHash,
  generateProof,
  packToSolidityProof,
  PublicSignals,
  SolidityProof
} from "@webb-tools/semaphore-proof"
import { fetchComponentsFromFilePaths } from "@webb-tools/utils"

import { createRootsBytes } from "../utils"
// import { SemaphoreVoting as SemaphoreVotingContract } from "../../build/typechain"
import { SemaphoreVoting } from "../../src/semaphoreVoting"

const path = require("path")

describe("SemaphoreVoting", () => {
  let semaphore: SemaphoreVoting
  let signers: Signer[]
  let coordinatorAddr: string
  let coordinator: Signer
  let user: Signer

  const zeroValue = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )
  const chainId = BigInt(1099511629113)
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const pollIds = [1, 2, 3]
  const encryptionKey = BigInt(0)
  const decryptionKey = BigInt(0)
  const maxEdges = 1
  // const circuitLength = Number(process.env.CIRCUIT_LENGTH) | 2
  const wasmFilePath20_2 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  )
  const witnessCalcPath20_2 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/witness_calculator.js`
  )
  const zkeyFilePath20_2 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`
  )

  const wasmFilePath20_8 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/semaphore_20_8.wasm`
  )
  const witnessCalcPath20_8 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/witness_calculator.js`
  )
  const zkeyFilePath20_8 = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/circuit_final.zkey`
  )
  before(async () => {
    signers = await run("accounts", { logs: false })
    coordinatorAddr = await signers[1].getAddress()
    coordinator = signers[1]
    user = signers[0]

    const zkComponents20_2 = await fetchComponentsFromFilePaths(
      wasmFilePath20_2,
      witnessCalcPath20_2,
      zkeyFilePath20_2
    )
    const zkComponents20_8 = await fetchComponentsFromFilePaths(
      wasmFilePath20_8,
      witnessCalcPath20_8,
      zkeyFilePath20_8
    )
    semaphore = await SemaphoreVoting.createSemaphoreVoting(
      treeDepth,
      zkComponents20_2,
      zkComponents20_8,
      signers[0]
    )
  })

  describe("# createPoll", () => {
    it("Should not create a poll with a wrong depth", async () => {
      const transaction = semaphore.contract.createPoll(
        pollIds[0],
        10,
        coordinatorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith(
        "Semaphore__MerkleTreeDepthIsNotSupported()"
      )
    })

    it("Should not create a poll greater than the snark scalar field", async () => {
      const transaction = semaphore.contract.createPoll(
        BigInt(
          "21888242871839275222246405745257275088548364400416034343698204186575808495618"
        ),
        treeDepth,
        coordinatorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith(
        "Semaphore__GroupIdIsNotLessThanSnarkScalarField()"
      )
    })

    it("Should create a poll", async () => {
      const transaction = semaphore.createPoll(
        pollIds[0],
        treeDepth,
        coordinatorAddr,
        maxEdges
      )

      await expect(transaction)
        .emit(semaphore.contract, "PollCreated")
        .withArgs(pollIds[0], coordinatorAddr)
    })

    it("Should not create a poll if it already exists", async () => {
      const transaction = semaphore.contract.createPoll(
        pollIds[0],
        treeDepth,
        coordinatorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith("Semaphore__GroupAlreadyExists()")
    })
  })

  describe("# startPoll", () => {
    it("Should not start the poll if the caller is not the coordinator", async () => {
      await semaphore.setSigner(user)
      const transaction = semaphore.startPoll(pollIds[0], encryptionKey)

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotThePollCoordinator()"
      )
    })

    it("Should start the poll", async () => {
      await semaphore.setSigner(coordinator)
      const transaction = semaphore.startPoll(pollIds[0], encryptionKey)

      await expect(transaction)
        .emit(semaphore.contract, "PollStarted")
        .withArgs(pollIds[0], coordinatorAddr, encryptionKey)
    })

    it("Should not start a poll if it has already been started", async () => {
      await semaphore.setSigner(coordinator)
      const transaction = semaphore.startPoll(pollIds[0], encryptionKey)

      await expect(transaction).revertedWith(
        "emaphore__PollHasAlreadyBeenStarted()"
      )
    })
  })

  describe("# addVoter", () => {
    before(async () => {
      await semaphore.createPoll(
        pollIds[1],
        treeDepth,
        coordinatorAddr,
        maxEdges
      )
    })

    it("Should not add a voter if the caller is not the coordinator", async () => {
      const identity = new Identity()
      const identityCommitment = identity.commitment

      await semaphore.setSigner(user)
      const transaction = semaphore.addVoter(pollIds[0], identityCommitment)

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotThePollCoordinator()"
      )
    })

    it("Should not add a voter if the poll has already been started", async () => {
      const identity = new Identity()
      const identityCommitment = identity.generateCommitment()

      await semaphore.setSigner(coordinator)
      const transaction = semaphore.addVoter(pollIds[0], identityCommitment)

      await expect(transaction).revertedWith(
        "Semaphore__PollHasAlreadyBeenStarted()"
      )
    })

    it("Should add a voter to an existing poll", async () => {
      const identity = new Identity("test")
      const identityCommitment = identity.commitment

      const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)
      group.addMember(identityCommitment)

      const transaction = semaphore.addVoter(pollIds[1], identityCommitment)

      await expect(transaction)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(
          pollIds[1],
          0,
          identityCommitment,
          group.root
          // "7943806797233700547041913393384710769504872928213070894800658208056456315893"
        )
    })

    it("Should return the correct number of poll voters", async () => {
      const size = await semaphore.getNumberVoters(pollIds[1])

      expect(size).eq(1)
    })
  })

  describe("# castVote", () => {
    const identity = new Identity("test")
    const identityCommitment = identity.commitment
    const vote = "1"
    const bytes32Vote = utils.formatBytes32String(vote)

    const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)

    group.addMember(identityCommitment)
    group.addMember(BigInt(1))

    let solidityProof: SolidityProof
    let publicSignals: PublicSignals

    before(async () => {
      await semaphore.setSigner(coordinator)
      await semaphore.addVoter(pollIds[1], BigInt(1))
      await semaphore.startPoll(pollIds[1], encryptionKey)
      await semaphore.createPoll(
        pollIds[2],
        treeDepth,
        coordinatorAddr,
        maxEdges
      )

      const fullProof = await generateProof(
        identity,
        group,
        BigInt(pollIds[1]),
        vote,
        chainId,
        {
          wasmFilePath: wasmFilePath20_2,
          zkeyFilePath: zkeyFilePath20_2
        }
      )

      publicSignals = fullProof.publicSignals
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should not cast a vote if the caller is not the coordinator", async () => {
      await semaphore.setSigner(user)
      const transaction = semaphore.contract.castVote(
        bytes32Vote,
        publicSignals.nullifierHash,
        pollIds[0],
        createRootsBytes(publicSignals.roots),
        solidityProof
      )

      await expect(transaction).revertedWith(
        "emaphore__CallerIsNotThePollCoordinator()"
      )
    })

    it("Should not cast a vote if the poll is not ongoing", async () => {
      const transaction = semaphore.contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          publicSignals.nullifierHash,
          pollIds[2],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).revertedWith("Semaphore__PollIsNotOngoing()")
    })

    it("Should not cast a vote if the proof is not valid", async () => {
      const nullifierHash = generateNullifierHash(
        BigInt(pollIds[0]),
        identity.nullifier
      )

      const transaction = semaphore.contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          nullifierHash,
          pollIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).revertedWith("invalidProof")
    })

    it("Should cast a vote", async () => {
      await semaphore.setSigner(coordinator)
      const { transaction } = await semaphore.castVote(
        identity,
        vote,
        pollIds[1],
        Number(chainId)
      )

      await expect(transaction)
        .emit(semaphore.contract, "VoteAdded")
        .withArgs(pollIds[1], bytes32Vote)
    })

    it("Should not cast a vote twice", async () => {
      const transaction = semaphore.contract
        .connect(signers[1])
        .castVote(
          bytes32Vote,
          publicSignals.nullifierHash,
          pollIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).revertedWith(
        "Semaphore__YouAreUsingTheSameNillifierTwice()"
      )
    })
  })

  describe("# endPoll", () => {
    it("Should not end the poll if the caller is not the coordinator", async () => {
      await semaphore.setSigner(user)
      const transaction = semaphore.contract.endPoll(pollIds[1], decryptionKey)

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotThePollCoordinator()"
      )
    })

    it("Should end the poll", async () => {
      await semaphore.setSigner(coordinator)
      const transaction = semaphore.endPoll(pollIds[1], decryptionKey)

      await expect(transaction)
        .emit(semaphore.contract, "PollEnded")
        .withArgs(pollIds[1], coordinatorAddr, decryptionKey)
    })

    it("Should not end a poll if it has already been ended", async () => {
      await semaphore.setSigner(coordinator)
      const transaction = semaphore.endPoll(pollIds[1], decryptionKey)

      await expect(transaction).revertedWith("Semaphore__PollIsNotOngoing()")
    })
  })
})
