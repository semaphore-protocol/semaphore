import { expect } from "chai"
import { constants, Signer, utils, ContractReceipt, BigNumber } from "ethers"
import { ethers } from "hardhat"
import {
  Semaphore as SemaphoreContract,
  Semaphore__factory,
  ISemaphore,
  SemaphoreGroups
} from "../../packages/semaphore/typechain"
// import { config } from "../../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Semaphore } from "@webb-tools/semaphore"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import {
  FullProof,
  generateProof,
  packToSolidityProof,
  SolidityProof
} from "../../packages/proof/src"
import { fetchComponentsFromFilePaths } from "@webb-tools/utils"
import { toFixedHex, createRootsBytes, createIdentities } from "../utils"

describe("Semaphore", () => {
  let semaphore: Semaphore
  let signers: Signer[]
  let admin: Signer
  let adminAddr: string
  let user: Signer
  let userAddr: string
  let accounts: string[]

  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  // const circuitLength = Number(process.env.CIRCUIT_LENGTH) | 2
  const groupId = 1
  const maxEdges = 1
  const chainID = BigInt(1099511629113)
  const { identities, members } = createIdentities(Number(chainID), 3)

  const wasmFilePath =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  const witnessCalcPath =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/witness_calculator.js`
  const zkeyFilePath =
    __dirname +
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`

  before(async () => {
    signers = await ethers.getSigners()
    admin = signers[0]
    adminAddr = await admin.getAddress()
    user = signers[1]
    userAddr = await user.getAddress()

    accounts = await Promise.all(
      signers.map((signer: Signer) => signer.getAddress())
    )

    const zkComponents2_2 = await fetchComponentsFromFilePaths(
      wasmFilePath,
      witnessCalcPath,
      zkeyFilePath
    )
    semaphore = await Semaphore.createSemaphore(
      treeDepth,
      maxEdges,
      zkComponents2_2,
      admin
    )

    await semaphore.setSigner(user)

    // contract = await semaphore.contract.connect(user)
  })

  describe("# createGroup", () => {
    it("Should not create a group if the tree depth is not supported", async () => {
      // testing directly in the contract. Typescript fails if called directly too
      const transaction = semaphore.contract.createGroup(
        groupId,
        10,
        adminAddr,
        maxEdges,
        { gasLimit: "0x5B8D80" }
      )

      await expect(transaction).to.be.revertedWith(
        "Semaphore__TreeDepthIsNotSupported"
      )
    })

    it("Should create a group", async () => {
      await semaphore.setSigner(admin)
      // const transaction = semaphore.contract.createGroup(groupId, treeDepth, await admin.getAddress(), maxEdges)
      const transaction = semaphore.createGroup(
        groupId,
        treeDepth,
        await admin.getAddress(),
        maxEdges
      )

      await expect(transaction)
        .to.emit(semaphore.contract, "GroupCreated")
        .withArgs(groupId, treeDepth)
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

      const linkedGroup = new LinkedGroup(treeDepth, maxEdges)
      linkedGroup.addMember(members[0])

      const transaction = semaphore.addMember(groupId, members[0])

      await expect(transaction)
        .to.emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId, members[0], linkedGroup.root)
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

  describe("# verifyProof", () => {
    const signal = "Hello world"
    const bytes32Signal = utils.formatBytes32String(signal)
    const groupId2 = 1337

    const linkedGroup = new LinkedGroup(treeDepth, maxEdges)
    linkedGroup.addMember(members[0])
    linkedGroup.addMember(members[1])
    linkedGroup.addMember(members[2])

    let fullProof: FullProof
    let solidityProof: SolidityProof
    let roots: string[]

    before(async () => {
      await semaphore.createGroup(groupId2, treeDepth, accounts[0], maxEdges)

      // const defaultRoot = await semaphore.contract.getLatestNeighborEdges(groupId2)

      await semaphore.addMember(groupId2, members[0])
      await semaphore.addMember(groupId2, members[1])
      await semaphore.addMember(groupId2, members[2])

      roots = linkedGroup.getRoots().map((bignum) => bignum.toHexString())

      fullProof = await generateProof(
        identities[0],
        linkedGroup,
        BigNumber.from(Date.now()),
        signal,
        chainID,
        {
          wasmFilePath,
          zkeyFilePath
        }
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
      const transaction = semaphore.verifyIdentity(
        identities[0],
        signal,
        groupId2,
        chainID,
        BigNumber.from(Date.now())
      )

      await expect(transaction)
        .to.emit(semaphore.contract, "ProofVerified")
        .withArgs(groupId2, bytes32Signal)
    })
  })
})
