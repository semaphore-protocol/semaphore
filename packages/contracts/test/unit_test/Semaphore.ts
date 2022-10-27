import { expect } from "chai"
import { constants, Signer, utils, ContractReceipt, BigNumber } from "ethers"
import { ethers } from "hardhat"
// import { config } from "../../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Semaphore } from "@webb-tools/semaphore"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import {
  FullProof,
  generateProof,
  packToSolidityProof,
  SolidityProof
} from "@webb-tools/semaphore-proof"
import { fetchComponentsFromFilePaths } from "@webb-tools/utils"
import { createRootsBytes, createIdentities } from "../utils"

describe("Semaphore", () => {
  // Semaphore with 1 maxEdge
  let semaphore: Semaphore
  let signers: Signer[]
  let admin: Signer
  let adminAddr: string
  let user: Signer
  let userAddr: string
  let accounts: string[]
  const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")


  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  // const circuitLength = Number(process.env.CIRCUIT_LENGTH) | 2
  const groupId = 1
  const maxEdges1 = 1
  const chainID = BigInt(1099511629113)
  const { identities, members } = createIdentities(3)

  const wasmFilePath20_2 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  const witnessCalcPath20_2 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/witness_calculator.js`
  const zkeyFilePath20_2 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`

  const wasmFilePath20_8 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/semaphore_20_8.wasm`
  const witnessCalcPath20_8 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/witness_calculator.js`
  const zkeyFilePath20_8 =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/8/circuit_final.zkey`

  before(async () => {
    signers = await ethers.getSigners()
    admin = signers[0]
    adminAddr = await admin.getAddress()
    user = signers[1]
    userAddr = await user.getAddress()

    accounts = await Promise.all(
      signers.map((signer: Signer) => signer.getAddress())
    )

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
    semaphore = await Semaphore.createSemaphore(
      treeDepth,
      zkComponents20_2,
      zkComponents20_8,
      admin
    )
    await semaphore.setSigner(user)

    // contract = await semaphore.contract.connect(user)
  })

  describe("# createGroup", () => {
    it("Should not create a group if the tree depth is not supported", async () => {
      // testing directly in the contract. Typescript fails if called directly too
      const transaction = semaphore.contract
      ["createGroup(uint256,uint256,address,uint8)"](
        groupId,
        10,
        adminAddr,
        maxEdges1,
        { gasLimit: "0x5B8D80" }
      )

      await expect(transaction).revertedWith(
        "Semaphore__MerkleTreeDepthIsNotSupported"
      )
    })

    it("Should create a group", async () => {
      await semaphore.setSigner(admin)

      const transaction = semaphore.createGroup(
        groupId,
        treeDepth,
        await admin.getAddress(),
        maxEdges1
      )

      await expect(transaction)
        .to.emit(semaphore.contract, "GroupCreated")
        .withArgs(groupId, treeDepth, semaphore.linkedGroups[groupId].root)
      await expect(transaction)
        .to.emit(semaphore.contract, "GroupAdminUpdated")
        .withArgs(groupId, constants.AddressZero, adminAddr)
    })
  })

  describe("# updateGroupAdmin", () => {
    it("Should not update a group admin if the caller is not the group admin", async () => {
      await semaphore.setSigner(user)

      const transaction = semaphore.updateGroupAdmin(groupId, userAddr)

      await expect(transaction).revertedWith(
        "Semaphore__CallerIsNotTheGroupAdmin()"
      )
    })

    it("Should update the group admin", async () => {
      await semaphore.setSigner(admin)

      const receipt: ContractReceipt = await semaphore.updateGroupAdmin(
        groupId,
        userAddr
      )

      expect(receipt)
        .emit(semaphore.contract, "GroupAdminUpdated")
        .withArgs(groupId, adminAddr, userAddr)

      // reseting admin for rest of test
      await semaphore.setSigner(user)

      const receipt2: ContractReceipt = await semaphore.updateGroupAdmin(
        groupId,
        adminAddr
      )
      expect(receipt2)
        .emit(semaphore.contract, "GroupAdminUpdated")
        .withArgs(groupId, userAddr, adminAddr)
    })
  })

  describe("# addMember", () => {
    it("Should not add a member if the caller is not the group admin", async () => {
      await semaphore.setSigner(user)
      const member = BigInt(2)

      const transaction = semaphore.addMember(groupId, member)

      await expect(transaction).to.be.revertedWith(
        "Semaphore__CallerIsNotTheGroupAdmin()"
      )
    })

    it("Should add a new member in an existing group", async () => {
      await semaphore.setSigner(admin)

      const linkedGroup = new LinkedGroup(treeDepth, maxEdges1, zeroValue)
      linkedGroup.addMember(members[0])

      const transaction = semaphore.addMember(groupId, members[0])

      await expect(transaction)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId, 0, members[0], linkedGroup.root)
    })
  })

  // describe("# removeMember", () => {
  //     it("Should not remove a member if the caller is not the group admin", async () => {
  //         const transaction = contract.connect(signers[1]).removeMember(groupId, members[0], [0, 1], [0, 1])
  //
  //         await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
  //     })
  //
  //     it("Should remove a member from an existing group", async () => {
  //         const groupId = 100
  //         const group = new Group(treeDepth, BigInt(zeroValue))
  //
  //         group.addMembers([BigInt(1), BigInt(2), BigInt(3)])
  //
  //         group.removeMember(0)
  //
  //         await contract.createGroup(groupId, treeDepth, accounts[0], maxEdges)
  //         await contract.addMember(groupId, BigInt(1))
  //         await contract.addMember(groupId, BigInt(2))
  //         await contract.addMember(groupId, BigInt(3))
  //
  //         const { siblings, pathIndices, root } = group.generateProofOfMembership(0)
  //
  //         const transaction = contract.removeMember(groupId, BigInt(1), siblings, pathIndices)
  //
  //         await expect(transaction).to.emit(contract, "MemberRemoved").withArgs(groupId, BigInt(1), root)
  //     })
  // })

  describe("# verifyProof 1 maxEdge", () => {
    const signal = "Hello world"
    const bytes32Signal = utils.formatBytes32String(signal)
    const groupId2 = 1340


    let fullProof: FullProof
    let solidityProof: SolidityProof
    let roots: string[]

    before(async () => {
      let tx = await semaphore.createGroup(groupId2, treeDepth, accounts[0], maxEdges1)
      await expect(tx)
        .emit(semaphore.contract, "GroupCreated")
        .withArgs(groupId2, treeDepth, semaphore.linkedGroups[groupId2].root)
      const linkedGroup = new LinkedGroup(treeDepth, maxEdges1, zeroValue)

      // const defaultRoot = await semaphore.contract.getLatestNeighborEdges(groupId2)
      let initialRoot = await semaphore.getMerkleTreeRoot(groupId2)

      expect(linkedGroup.root).equals(initialRoot)


      tx = await semaphore.addMember(groupId2, members[0])
      linkedGroup.addMember(members[0])
      await expect(tx)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId2, 0, members[0], linkedGroup.root)

      initialRoot = await semaphore.getMerkleTreeRoot(groupId2)
      expect(linkedGroup.root).equals(initialRoot)



      tx = await semaphore.addMember(groupId2, members[1])
      linkedGroup.addMember(members[1])
      await expect(tx)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId2, 1, members[1], linkedGroup.root)

      initialRoot = await semaphore.getMerkleTreeRoot(groupId2)
      expect(linkedGroup.root).equals(initialRoot)


      tx = await semaphore.addMember(groupId2, members[2])
      linkedGroup.addMember(members[2])
      await expect(tx)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId2, 2, members[2], linkedGroup.root)

      initialRoot = await semaphore.getMerkleTreeRoot(groupId2)
      expect(linkedGroup.root).equals(initialRoot)

      roots = linkedGroup.getRoots().map((bignum) => bignum.toString())

      fullProof = await generateProof(
        identities[0],
        linkedGroup,
        BigNumber.from(Date.now()),
        signal,
        chainID,
        {
          wasmFilePath: wasmFilePath20_2,
          zkeyFilePath: zkeyFilePath20_2
        },
        roots
      )
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should not verify a proof if the group does not exist", async () => {
      const transaction = semaphore.contract.verifyProof(
        10,
        bytes32Signal,
        0,
        0,
        createRootsBytes(roots),
        [0, 0, 0, 0, 0, 0, 0, 0]
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__GroupDoesNotExist()"
      )
    })

    it("Should throw an exception if the proof is not valid", async () => {
      const transaction = semaphore.contract.verifyProof(
        groupId2,
        bytes32Signal,
        fullProof.publicSignals.nullifierHash,
        0,
        createRootsBytes(roots),
        solidityProof
      )
      await expect(transaction).to.be.revertedWith("invalidProof")
    })

    it("Should verify a proof for an onchain group correctly", async () => {
      const { transaction, fullProof } = await semaphore.verifyIdentity(
        identities[0],
        signal,
        groupId2,
        Number(chainID),
        BigNumber.from(Date.now())
      )

      await expect(transaction)
        .to.emit(semaphore.contract, "ProofVerified")
        .withArgs(
          groupId2,
          semaphore.linkedGroups[groupId2].root,
          fullProof.publicSignals.nullifierHash,
          fullProof.publicSignals.externalNullifier,
          bytes32Signal
        )
    })
  })
  describe("# verifyProof 7 maxEdges", () => {
    const signal = "Hello world"
    const bytes32Signal = utils.formatBytes32String(signal)
    const groupId3 = 1338
    const maxEdges7 = 7

    const linkedGroup = new LinkedGroup(treeDepth, maxEdges7, zeroValue)
    linkedGroup.addMember(members[0])
    linkedGroup.addMember(members[1])
    linkedGroup.addMember(members[2])

    let fullProof: FullProof
    let solidityProof: SolidityProof
    let roots: string[]

    before(async () => {
      await semaphore.setSigner(admin)
      await semaphore.createGroup(groupId3, treeDepth, accounts[0], maxEdges7)

      await semaphore.addMember(groupId3, members[0])
      await semaphore.addMember(groupId3, members[1])
      await semaphore.addMember(groupId3, members[2])

      roots = linkedGroup
        .getRoots()
        .map((bignum: BigNumber) => bignum.toHexString())

      fullProof = await generateProof(
        identities[0],
        linkedGroup,
        BigNumber.from(Date.now()),
        signal,
        chainID,
        {
          wasmFilePath: wasmFilePath20_8,
          zkeyFilePath: zkeyFilePath20_8
        }
      )
      solidityProof = packToSolidityProof(fullProof.proof)
    })

    it("Should throw an exception if the proof is not valid", async () => {
      const transaction = semaphore.contract.verifyProof(
        groupId3,
        bytes32Signal,
        fullProof.publicSignals.nullifierHash,
        0,
        createRootsBytes(roots),
        solidityProof,
        { gasLimit: "0x5B8D80" }
      )
      await expect(transaction).to.be.revertedWith("invalidProof")
    })

    it("Should verify a proof for an onchain group correctly", async () => {
      const { transaction, fullProof } = await semaphore.verifyIdentity(
        identities[0],
        signal,
        groupId3,
        Number(chainID),
        BigNumber.from(Date.now())
      )
      await expect(transaction)
        .to.emit(semaphore.contract, "ProofVerified")
        .withArgs(
          groupId3,
          semaphore.linkedGroups[groupId3].root,
          fullProof.publicSignals.nullifierHash,
          fullProof.publicSignals.externalNullifier,
          bytes32Signal
        )
    })
  })
})
