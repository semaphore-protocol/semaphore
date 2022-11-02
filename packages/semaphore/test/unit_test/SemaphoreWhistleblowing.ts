import { expect } from "chai"
import { Signer, utils } from "ethers"
import { run } from "hardhat"

import {
  generateNullifierHash,
  generateProof,
  packToSolidityProof,
  PublicSignals,
  SolidityProof
} from "@webb-tools/semaphore-proof"
import { fetchComponentsFromFilePaths } from "@webb-tools/utils"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { Identity } from "@webb-tools/semaphore-identity"
import { SemaphoreWhistleblowing } from "../../src"

import { createRootsBytes } from "../utils"

const path = require("path")

describe("SemaphoreWhistleblowing", () => {
  let semaphore: SemaphoreWhistleblowing
  let signers: Signer[]
  let editorAddr: string
  let editor: Signer
  let user: Signer

  const entityIds = [1, 2]
  const zeroValue = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )
  const chainId = BigInt(1099511629113)
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
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
    editorAddr = await signers[1].getAddress()
    editor = signers[1]
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
    semaphore = await SemaphoreWhistleblowing.createSemaphoreWhistleblowing(
      treeDepth,
      zkComponents20_2,
      zkComponents20_8,
      signers[0]
    )
  })

  describe("# createEntity", () => {
    it("Should not create an entity with a wrong depth", async () => {
      const transaction = semaphore.contract.createEntity(
        entityIds[0],
        10,
        editorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith(
        "Semaphore__MerkleTreeDepthIsNotSupported()"
      )
    })

    it("Should not create an entity greater than the snark scalar field", async () => {
      const transaction = semaphore.contract.createEntity(
        BigInt(
          "21888242871839275222246405745257275088548364400416034343698204186575808495618"
        ),
        treeDepth,
        editorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith(
        "Semaphore__GroupIdIsNotLessThanSnarkScalarField()"
      )
    })

    it("Should create an entity", async () => {
      const transaction = semaphore.createEntity(
        entityIds[0],
        treeDepth,
        editorAddr,
        maxEdges
      )

      await expect(transaction)
        .emit(semaphore.contract, "EntityCreated")
        .withArgs(entityIds[0], editorAddr)
    })

    it("Should not create a entity if it already exists", async () => {
      const transaction = semaphore.contract.createEntity(
        entityIds[0],
        treeDepth,
        editorAddr,
        maxEdges
      )

      await expect(transaction).revertedWith("Semaphore__GroupAlreadyExists()")
    })
  })

  describe("# addWhistleblower", () => {
    it("Should not add a whistleblower if the caller is not the editor", async () => {
      const identity = new Identity()
      const identityCommitment = identity.generateCommitment()
      await semaphore.setSigner(user)

      const transaction = semaphore.contract.addWhistleblower(
        entityIds[0],
        identityCommitment
      )

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotTheEditor()"
      )
    })

    it("Should add a whistleblower to an existing entity", async () => {
      await semaphore.setSigner(editor)
      const identity = new Identity("test")
      const identityCommitment = identity.generateCommitment()

      const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)
      group.addMember(identityCommitment)

      const transaction = semaphore.addWhistleblower(
        entityIds[0],
        identityCommitment
      )

      await expect(transaction)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(
          entityIds[0],
          0,
          identityCommitment,
          group.root
          // "7943806797233700547041913393384710769504872928213070894800658208056456315893"
        )
    })

    it("Should return the correct number of whistleblowers of an entity", async () => {
      const size = await semaphore.getNumberOfMerkleTreeLeaves(entityIds[0])

      expect(size).eq(1)
    })
  })

  // NOTE: this is not currently a working feature in the cross-chain setting
  // describe("# removeWhistleblower", () => {
  //   it("Should not remove a whistleblower if the caller is not the editor", async () => {
  //     const identity = new Identity()
  //     const identityCommitment = identity.generateCommitment()
  //     const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)
  //
  //     group.addMember(identityCommitment)
  //
  //     const { pathElements, pathIndices } = group.generateProofOfMembership(0)
  //
  //     const transaction = semaphore.removeWhistleblower(
  //       entityIds[0],
  //       identityCommitment,
  //       pathElements,
  //       pathIndices
  //     )
  //
  //     await expect(transaction).revertedWith(
  //       "Semaphore__CallerIsNotTheEditor()"
  //     )
  //   })

  // it("Should remove a whistleblower from an existing entity", async () => {
  //   const identity = new Identity("test")
  //   const identityCommitment = identity.generateCommitment()
  //   const group = new LinkedGroup(treeDepth, maxEdges)
  //
  //   group.addMember(identityCommitment)
  //
  //   const { pathElements, pathIndices } = group.generateProofOfMembership(0)
  //
  //   const transaction = contract
  //     .connect(signers[1])
  //     .removeWhistleblower(
  //       entityIds[0],
  //       identityCommitment,
  //       pathElements,
  //       pathIndices
  //     )
  //
  //   await expect(transaction)
  //     .emit(contract, "MemberRemoved")
  //     .withArgs(
  //       entityIds[0],
  //       identityCommitment,
  //       "19476726467694243150694636071195943429153087843379888650723427850220480216251"
  //     )
  // })
  // })

  describe("# publishLeak", () => {
    const identity = new Identity("test")
    const identityCommitment = identity.commitment
    const leak = "leak"
    const bytes32Leak = utils.formatBytes32String(leak)

    const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)

    group.addMember(identityCommitment)
    group.addMember(BigInt(1))

    let solidityProof: SolidityProof
    let publicSignals: PublicSignals

    before(async () => {
      await semaphore.setSigner(editor)
      await semaphore.createEntity(
        entityIds[1],
        treeDepth,
        editorAddr,
        maxEdges
      )
      await semaphore.addWhistleblower(entityIds[1], identityCommitment)
      await semaphore.addWhistleblower(entityIds[1], BigInt(1))
      // const root = await contract.getRoot(entityIds[1])
      const fullProof = await generateProof(
        identity,
        group,
        entityIds[1],
        leak,
        chainId,
        {
          wasmFilePath: wasmFilePath20_2,
          zkeyFilePath: zkeyFilePath20_2
        }
      )

      publicSignals = fullProof.publicSignals
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should not publish a leak if the caller is not the editor", async () => {
      const transaction = semaphore.contract.publishLeak(
        bytes32Leak,
        publicSignals.nullifierHash,
        entityIds[0],
        createRootsBytes(publicSignals.roots),
        solidityProof
      )

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotTheEditor()"
      )
    })

    it("Should not publish a leak if the proof is not valid", async () => {
      const nullifierHash = generateNullifierHash(
        BigInt(entityIds[0]),
        identity.nullifier
      )

      const transaction = semaphore.contract
        .connect(signers[1])
        .publishLeak(
          bytes32Leak,
          nullifierHash,
          entityIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction).revertedWith("invalidProof")
    })

    it("Should publish a leak", async () => {
      const { transaction } = await semaphore.publishLeak(
        identity,
        leak,
        entityIds[1],
        Number(chainId)
      )

      await expect(transaction)
        .emit(semaphore.contract, "LeakPublished")
        .withArgs(entityIds[1], bytes32Leak)
    })
  })
})
