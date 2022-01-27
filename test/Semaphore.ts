import { ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, genExternalNullifier, genSignalHash, Semaphore } from "@zk-kit/protocols"
import { expect } from "chai"
import { ethers, run } from "hardhat"
import { join } from "path"
import { Semaphore as SemaphoreContract } from "../build/typechain"

describe("Semaphore", () => {
  let contract: SemaphoreContract
  let defaultExternalNullifier: any
  let newExternalNullifier: any

  const identityCommitments: bigint[] = []
  const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(["bytes"], [ethers.utils.toUtf8Bytes("Semaphore")]))

  before(async () => {
    defaultExternalNullifier = genExternalNullifier("voting_1")
    newExternalNullifier = genExternalNullifier("voting-2")

    contract = await run("deploy:semaphore", { logs: false, nullifier: "voting_1" })

    const leafIndex = 3

    for (let i = 0; i < leafIndex; i++) {
      const tmpIdentity = new ZkIdentity()
      const tmpCommitment = tmpIdentity.genIdentityCommitment()

      identityCommitments.push(tmpCommitment)

      await contract.insertIdentity(tmpCommitment)
    }
  })

  describe("Proof", () => {
    it("Should generate full semaphore proof", async () => {
      const identity = new ZkIdentity()
      const identityCommitment = identity.genIdentityCommitment()

      await contract.insertIdentity(identityCommitment)

      const signal = "0x111"
      const nullifierHash = Semaphore.genNullifierHash(defaultExternalNullifier, identity.getNullifier())

      const commitments = Object.assign([], identityCommitments)
      commitments.push(identityCommitment)

      const merkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        defaultExternalNullifier,
        signal
      )

      const wasmFilePath = join("./build/snark", "semaphore.wasm")
      const finalZkeyPath = join("./build/snark", "semaphore_final.zkey")

      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof)

      const packedProof = await contract.packProof(solidityProof.a, solidityProof.b, solidityProof.c)

      const preBroadcastCheck = await contract.preBroadcastCheck(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
        packedProof,
        merkleProof.root,
        nullifierHash,
        genSignalHash(signal),
        defaultExternalNullifier
      )

      expect(preBroadcastCheck).to.be.true

      const response = await contract.broadcastSignal(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
        packedProof,
        merkleProof.root,
        nullifierHash,
        defaultExternalNullifier
      )

      expect(response).to.not.equal(null)
    })
  })

  describe("ExternalNullifier", () => {
    it("Default nullifier should be active", async () => {
      const isActive = await contract.isExternalNullifierActive(defaultExternalNullifier)
      expect(isActive).to.be.true
    })
    it("ExternalNullifier should be active after add", async () => {
      await contract.addExternalNullifier(newExternalNullifier)
      const isActive = await contract.isExternalNullifierActive(newExternalNullifier)
      expect(isActive).to.be.true
    })
    it("ExternalNullifier should not be active after deactivation", async () => {
      await contract.deactivateExternalNullifier(newExternalNullifier)
      const isActive = await contract.isExternalNullifierActive(newExternalNullifier)
      expect(isActive).to.be.false
    })
    it("ExternalNullifier should be active after reactivation", async () => {
      await contract.reactivateExternalNullifier(newExternalNullifier)
      const isActive = await contract.isExternalNullifierActive(newExternalNullifier)
      expect(isActive).to.be.true
    })
    it("Non owner should not be able to add nullifier", async () => {
      const [, addr1] = await ethers.getSigners()

      const newNullifier = genExternalNullifier("voting-3")
      await expect(contract.connect(addr1).addExternalNullifier(newNullifier)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      )
    })
    it("Non owner should be able to add nullifier after setPermissioning", async () => {
      await contract.setPermissioning(true)
      const newNullifier = genExternalNullifier("voting-3")
      await contract.addExternalNullifier(newNullifier)
      const isActive = await contract.isExternalNullifierActive(newNullifier)
      expect(isActive).to.be.true
    })
    it("Should fail to add already existing nullifier", async () => {
      await expect(contract.addExternalNullifier(newExternalNullifier)).to.be.revertedWith(
        "Semaphore: external nullifier already set"
      )
    })
    it("Should return newExternalNullifier as next nullifier", async () => {
      const nextNullifier = await contract.getNextExternalNullifier(defaultExternalNullifier)
      expect(nextNullifier).to.be.equal(newExternalNullifier)
    })
  })
})
