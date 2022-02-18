import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { Semaphore } from "@zk-kit/protocols"
import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, run } from "hardhat"
import { SemaphoreWhistleblowing } from "../build/typechain"
import { createMerkleProof } from "./utils"

describe("SemaphoreWhistleblowing", () => {
  let contract: SemaphoreWhistleblowing
  let accounts: Signer[]
  let editor: string

  const depth = 20
  const entityIds = [BigInt(1), BigInt(2)]

  before(async () => {
    const { address: verifierAddress } = await run("deploy:verifier", { logs: false })
    contract = await run("deploy:semaphore-whistleblowing", { logs: false, verifier: verifierAddress })
    accounts = await ethers.getSigners()
    editor = await accounts[1].getAddress()
  })

  describe("# createEntity", () => {
    it("Should not create an entity with a wrong depth", async () => {
      const transaction = contract.createEntity(entityIds[0], editor, 10)

      await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: depth value is not supported")
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
          "21535114724992190095497080437889044838904308549109546660414808669273607403748"
        )
    })

    it("Should return the correct number of whistleblowers of an entity", async () => {
      const size = await contract.getSize(entityIds[0])

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

    it("Should romove a whistleblower from an existing entity", async () => {
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
          "11785348627339250291169543927799678775640354218526699257718426075004026330510"
        )
    })
  })

  describe("# publishLeak", () => {
    const wasmFilePath = "./build/snark/semaphore.wasm"
    const finalZkeyPath = "./build/snark/semaphore_final.zkey"

    const identity = new ZkIdentity(Strategy.MESSAGE, "test")
    const identityCommitment = identity.genIdentityCommitment()
    const merkleProof = createMerkleProof([identityCommitment, BigInt(1)], identityCommitment)
    const leak = "leak"

    before(async () => {
      await contract.createEntity(entityIds[1], editor, depth)
      await contract.connect(accounts[1]).addWhistleblower(entityIds[1], identityCommitment)
      await contract.connect(accounts[1]).addWhistleblower(entityIds[1], BigInt(1))
    })

    it("Should not publish a leak if the caller is not the editor", async () => {
      const nullifierHash = Semaphore.genNullifierHash(entityIds[0], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        entityIds[0],
        leak
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.publishLeak(leak, nullifierHash, entityIds[0], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: caller is not the editor")
    })

    it("Should not publish a leak if the proof is not valid", async () => {
      const nullifierHash = Semaphore.genNullifierHash(entityIds[1], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        entityIds[0],
        leak
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).publishLeak(leak, nullifierHash, entityIds[1], solidityProof)

      await expect(transaction).to.be.revertedWith("SemaphoreWhistleblowing: the proof is not valid")
    })

    it("Should publish a leak", async () => {
      const nullifierHash = Semaphore.genNullifierHash(entityIds[1], identity.getNullifier())
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        entityIds[1],
        leak
      )
      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const transaction = contract.connect(accounts[1]).publishLeak(leak, nullifierHash, entityIds[1], solidityProof)

      await expect(transaction).to.emit(contract, "LeakPublished").withArgs(entityIds[1], leak)
    })
  })
})
