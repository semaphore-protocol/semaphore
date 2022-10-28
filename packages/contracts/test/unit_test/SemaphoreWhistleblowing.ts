import { expect } from "chai"
import { Signer, utils } from "ethers"
import { run } from "hardhat"
import { SemaphoreWhistleblowing } from "contracts/build/typechain"
import { config } from "../../package.json"

import { LinkedGroup } from "@webb-tools/semaphore-group"
import { Identity } from "@webb-tools/semaphore-identity"

import {
  generateNullifierHash,
  generateProof,
  packToSolidityProof,
  PublicSignals,
  SolidityProof
} from "@webb-tools/semaphore-proof"

import { VerifierContractInfo, createRootsBytes } from "../utils"

const path = require('path')

describe.only("SemaphoreWhistleblowing", () => {
  let contract: SemaphoreWhistleblowing
  let signers: Signer[]
  let editor: string

  const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
  const chainID = BigInt(1099511629113)
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const entityIds = [BigInt(1), BigInt(2)]
  const maxEdges = 1

  const wasmFilePath =
    path.join(__dirname,
      `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`)
  const zkeyFilePath =
    path.join(__dirname,
      `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`)

  before(async () => {
    const { address: v2Address } = await run("deploy:verifier", {
      logs: false,
      depth: treeDepth,
      circuitLength: 2
    })
    const VerifierV2: VerifierContractInfo = {
      name: `Verifier${treeDepth}_${2}`,
      address: v2Address,
      depth: `${treeDepth}`,
      circuitLength: `2`
    }

    const { address: v8Address } = await run("deploy:verifier", {
      logs: false,
      depth: treeDepth,
      circuitLength: 8
    })
    const VerifierV8: VerifierContractInfo = {
      name: `Verifier${treeDepth}_${8}`,
      address: v8Address,
      depth: `${treeDepth}`,
      circuitLength: `8`
    }

    const deployedVerifiers: Map<string, VerifierContractInfo> = new Map([
      ["v2", VerifierV2],
      ["v8", VerifierV8]
    ])

    const verifierSelector = await run("deploy:verifier-selector", {
      logs: true,
      verifiers: deployedVerifiers
    })
    contract = await run("deploy:semaphore-whistleblowing", {
      logs: true,
      verifier: verifierSelector.address
    })
    signers = await run("accounts", { logs: false })
    editor = await signers[1].getAddress()
  })

  describe("# createEntity", () => {
    it("Should not create an entity with a wrong depth", async () => {
      const transaction = contract.createEntity(
        entityIds[0],
        10,
        editor,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__MerkleTreeDepthIsNotSupported()"
      )
    })

    it("Should not create an entity greater than the snark scalar field", async () => {
      const transaction = contract.createEntity(
        BigInt(
          "21888242871839275222246405745257275088548364400416034343698204186575808495618"
        ),
        treeDepth,
        editor,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__GroupIdIsNotLessThanSnarkScalarField()"
      )
    })

    it("Should create an entity", async () => {
      const transaction = contract.createEntity(
        entityIds[0],
        treeDepth,
        editor,
        maxEdges
      )

      await expect(transaction)
        .emit(contract, "EntityCreated")
        .withArgs(entityIds[0], editor)
    })

    it("Should not create a entity if it already exists", async () => {
      const transaction = contract.createEntity(
        entityIds[0],
        treeDepth,
        editor,
        maxEdges
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__GroupAlreadyExists()"
      )
    })
  })

  describe("# addWhistleblower", () => {
    it("Should not add a whistleblower if the caller is not the editor", async () => {
      const identity = new Identity()
      const identityCommitment = identity.generateCommitment()

      const transaction = contract.addWhistleblower(
        entityIds[0],
        identityCommitment
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__CallerIsNotTheEditor()"
      )
    })

    it("Should add a whistleblower to an existing entity", async () => {
      const identity = new Identity("test")
      const identityCommitment = identity.generateCommitment()

      const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)
      group.addMember(identityCommitment)

      const transaction = contract
        .connect(signers[1])
        .addWhistleblower(entityIds[0], identityCommitment)

      await expect(transaction).to.emit(contract, "MemberAdded").withArgs(
        entityIds[0],
        0,
        identityCommitment,
        group.root
        // "7943806797233700547041913393384710769504872928213070894800658208056456315893"
      )
    })

    it("Should return the correct number of whistleblowers of an entity", async () => {
      const size = await contract.getNumberOfMerkleTreeLeaves(entityIds[0])

      expect(size).eq(1)
    })
  })

  describe("# removeWhistleblower", () => {
    it("Should not remove a whistleblower if the caller is not the editor", async () => {
      const identity = new Identity()
      const identityCommitment = identity.generateCommitment()
      const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)

      group.addMember(identityCommitment)

      const { pathElements, pathIndices } = group.generateProofOfMembership(0)

      const transaction = contract.removeWhistleblower(
        entityIds[0],
        identityCommitment,
        pathElements,
        pathIndices
      )

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotTheEditor()"
      )
    })

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
    //     .to.emit(contract, "MemberRemoved")
    //     .withArgs(
    //       entityIds[0],
    //       identityCommitment,
    //       "19476726467694243150694636071195943429153087843379888650723427850220480216251"
    //     )
    // })
  })

  describe("# publishLeak", () => {
    const identity = new Identity("test")
    const identityCommitment = identity.generateCommitment()
    const leak = "leak"
    const bytes32Leak = utils.formatBytes32String(leak)

    const group = new LinkedGroup(treeDepth, maxEdges, zeroValue)

    group.addMember(identityCommitment)
    group.addMember(BigInt(1))

    let solidityProof: SolidityProof
    let publicSignals: PublicSignals

    before(async () => {
      await contract.createEntity(entityIds[1], treeDepth, editor, maxEdges)
      await contract
        .connect(signers[1])
        .addWhistleblower(entityIds[1], identityCommitment)
      await contract
        .connect(signers[1])
        .addWhistleblower(entityIds[1], BigInt(1))
      // const root = await contract.getRoot(entityIds[1])

      const fullProof = await generateProof(
        identity,
        group,
        entityIds[1],
        leak,
        chainID,
        {
          wasmFilePath,
          zkeyFilePath
        }
      )

      publicSignals = fullProof.publicSignals
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should not publish a leak if the caller is not the editor", async () => {
      const transaction = contract.publishLeak(
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
        entityIds[0],
        identity.nullifier
      )

      const transaction = contract
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
      const transaction = contract
        .connect(signers[1])
        .publishLeak(
          bytes32Leak,
          publicSignals.nullifierHash,
          entityIds[1],
          createRootsBytes(publicSignals.roots),
          solidityProof
        )

      await expect(transaction)
        .to.emit(contract, "LeakPublished")
        .withArgs(entityIds[1], bytes32Leak)
    })
  })
})
