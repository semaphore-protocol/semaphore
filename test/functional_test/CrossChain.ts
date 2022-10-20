import { expect } from "chai"
import {
  constants,
  Signer,
  utils,
  BigNumber,
  providers,
  Wallet,
  ContractTransaction
} from "ethers"
import { ethers } from "hardhat"
import { Semaphore as SemaphoreContract } from "../../build/typechain"
import { config } from "../../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Identity } from "@webb-tools/identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { Semaphore } from "@webb-tools/semaphore"
import { startGanacheServer } from "../utils"
import {
  fetchComponentsFromFilePaths,
  getChainIdType,
  ZkComponents
} from "@webb-tools/utils"
import { HARDHAT_PK_1 } from "../../hardhatAccounts.js"
// import { Semaphore } from "../../packages/semaphore/src"

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

import {
  FullProof,
  generateProof,
  packToSolidityProof,
  SolidityProof
} from "../../packages/proof/src/"
import { toFixedHex, createRootsBytes, createIdentities } from "../utils"

describe("2-sided CrossChain tests", () => {
  let semaphore1: Semaphore
  let semaphore2: Semaphore

  let accounts: string[]
  let groupA: LinkedGroup
  let groupB: LinkedGroup

  let hardhatAdminAddr: string
  let ganacheAdminAddr: string
  let hardhatAdmin: Signer
  // let ganacheAdmin: Signer

  let membersA: bigint[]
  let membersB: bigint[]
  let identitiesA: Identity[]
  let identitiesB: Identity[]
  // let chainIDA: number
  // let chainIDB: number
  let allRootsA: string[]
  let allRootsB: string[]
  const groupIdNum = 2;

  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const maxEdges = 1
  const providerA = new providers.JsonRpcProvider("http://127.0.0.1:8545")
  const providerB = new providers.JsonRpcProvider("http://127.0.0.1:8546")
  // const contractAddr = "0xe800b887db490d9523212813a7907afdb7493e45"

  const AddMembersAndVerifyEvents = async (
    semaphore: Semaphore,
    numb: number,
    membersToAdd: BigNumber[],
    linkedGroup: LinkedGroup
  ): Promise<string[]> => {
    // const txs = await semaphore.addMembers(groupId, membersToAdd)
    const roots: string[] = [BigNumber.from(linkedGroup.root).toHexString()]
    for (let i = 0; i < membersToAdd.length; i++) {
      const tx = await semaphore.addMember(numb, membersToAdd[i])
      await linkedGroup.addMember(membersToAdd[i])
      const root = BigNumber.from(linkedGroup.group.root)
      // console.log('tx: ', tx)

      const receipt = await tx.wait()

      // console.log('receipt: ', receipt)
      await expect(tx)
        .to.emit(semaphore.contract, "MemberAdded")
        .withArgs(numb, membersToAdd[i], root)

      roots.push(root.toHexString())
    }
    return roots
  }

  const wasmFilePath =
    __dirname + `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  const witnessCalcPath =
    __dirname + `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/witness_calculator.js`
  const zkeyFilePath =
    __dirname + `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`

  // Cross-chain setup
  const FIRST_CHAIN_ID = 1337
  const hardhatWallet1 = new ethers.Wallet(HARDHAT_PK_1, ethers.provider)

  const SECOND_CHAIN_PORT = 10000
  const SECOND_CHAIN_ID = 10000
  const ganacheProvider2 = new ethers.providers.JsonRpcProvider(
    `http://localhost:${SECOND_CHAIN_ID}`
  )
  ganacheProvider2.pollingInterval = 1
  const ganacheAdmin = new ethers.Wallet(
    "c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e",
    ganacheProvider2
  )
  const chainIDA = getChainIdType(FIRST_CHAIN_ID)
  const chainIDB = getChainIdType(SECOND_CHAIN_ID)
  // setup ganache networks
  let ganacheServer2: any
  let historicalRootsA: string[]
  let historicalRootsB: string[]
  let signers: Signer[]

  before(async () => {
    ganacheServer2 = await startGanacheServer(
      SECOND_CHAIN_PORT,
      SECOND_CHAIN_ID,
      [
        {
          balance: "0x1000000000000000000000",
          secretKey:
            "0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e"
        }
      ]
    )
    signers = await ethers.getSigners()
    accounts = await Promise.all(
      signers.map((signer: Signer) => signer.getAddress())
    )

    ganacheAdminAddr = await ganacheAdmin.getAddress()
    hardhatAdminAddr = accounts[0]

    hardhatAdmin = signers[0]

    const zkComponents2_2 = await fetchComponentsFromFilePaths(
      wasmFilePath,
      witnessCalcPath,
      zkeyFilePath
    )

    semaphore1 = await Semaphore.createSemaphore(
      treeDepth,
      maxEdges,
      zkComponents2_2,
      hardhatAdmin
    )
    console.log(
      `Semaphore 1 has been deployed to ${semaphore1.contract.address} with signer: `,
      semaphore1.signer.provider.connection
    )

    await ganacheProvider2.ready

    semaphore2 = await Semaphore.createSemaphore(
      treeDepth,
      maxEdges,
      zkComponents2_2,
      ganacheAdmin
    )
    console.log(
      `Semaphore 2 has been deployed to ${semaphore2.contract.address} with signer: `,
      semaphore2.signer.provider.connection
    )

    // chainIDA = await semaphore1.contract.getChainIdType()
    // chainIDB = await semaphore2.contract.getChainIdType()
    // Creating members
    const idsA = createIdentities(chainIDA, 5)
    const idsB = createIdentities(chainIDB, 5)
    membersA = idsA.members
    identitiesA = idsA.identities
    membersB = idsB.members
    identitiesB = idsB.identities

    // Creating group on-chain and locally
    groupA = new LinkedGroup(treeDepth, maxEdges)
    const transactionA = semaphore1.createGroup(
      groupIdNum,
      treeDepth,
      hardhatAdminAddr,
      maxEdges
    )

    await expect(transactionA)
      .to.emit(semaphore1.contract, "GroupCreated")
      .withArgs(groupIdNum, treeDepth)

    await expect(transactionA)
      .to.emit(semaphore1.contract, "GroupAdminUpdated")
      .withArgs(groupIdNum, constants.AddressZero, hardhatAdminAddr)
    const rootA = await semaphore1.contract.getRoot(groupIdNum)
    expect(rootA).to.equal(groupA.root)

    const transactionB = semaphore2.createGroup(
      groupIdNum,
      treeDepth,
      ganacheAdminAddr,
      maxEdges
    )
    await expect(transactionB)
      .to.emit(semaphore2.contract, "GroupCreated")
      .withArgs(groupIdNum, treeDepth)
    await expect(transactionB)
      .to.emit(semaphore2.contract, "GroupAdminUpdated")
      .withArgs(groupIdNum, constants.AddressZero, ganacheAdminAddr)
    const rootB = await semaphore2.contract.getRoot(groupIdNum)

    groupB = new LinkedGroup(treeDepth, maxEdges)
    const defaultRoot = groupB.root
    expect(rootB).to.equal(groupB.root)
    allRootsB = [rootB.toHexString()]
    console.log("members slice: ", membersA.slice(0, 3))

    historicalRootsA = await AddMembersAndVerifyEvents(
      semaphore1,
      groupIdNum,
      membersA.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
      groupA
    )

    historicalRootsB = await AddMembersAndVerifyEvents(
      semaphore2,
      groupIdNum,
      membersB.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
      groupB
    )
  })
  describe("# CrossChainVerifyRoots", () => {
    let roots1: string[]
    let roots2: string[]
    // let roots_zero: string[]
    let rootA: BigNumber
    let rootB: BigNumber

    before(async () => {
      rootA = await semaphore1.linkedGroups[groupIdNum].getRoots()[0]
      rootB = await semaphore2.linkedGroups[groupIdNum].getRoots()[0]

      roots1 = [toFixedHex(rootA.toHexString()), toFixedHex(rootB.toHexString())]
      roots2 = [toFixedHex(rootB.toHexString()), toFixedHex(rootA.toHexString())]
      // roots_zero = [rootA.toHexString(), toFixedHex(0, 32)]
    })
    it("Should not verify if updateEdge has not been called", async () => {
      const signers = await ethers.getSigners()
      const transaction1 = semaphore1.contract.verifyRoots(
        groupIdNum,
        createRootsBytes(roots1)
      )
      await expect(transaction1).to.be.revertedWith(
        "non-existent edge is not set to the default root"
      )

      const transaction2 = semaphore2.contract.verifyRoots(
        groupIdNum,
        createRootsBytes(roots2)
      )
      await expect(transaction2).to.be.revertedWith(
        "non-existent edge is not set to the default root"
      )
    })

    it("Should verify external root after updateEdge", async () => {
      await semaphore2.updateEdge(groupIdNum, historicalRootsA[0], 0, chainIDA)

      const roots = [rootB.toHexString(), historicalRootsA[0]]
      const is_valid = await semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots)
      )

      expect(is_valid).to.equal(true)
    })
    it("Should not verify invalid order of roots", async () => {
      const transaction1 = semaphore1.verifyRoots(
        groupIdNum,
        createRootsBytes(roots2)
      )
      await expect(transaction1).to.be.revertedWith(
        "Cannot find your merkle root"
      )

      const transaction2 = semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots1)
      )
      await expect(transaction2).to.be.revertedWith(
        "Cannot find your merkle root"
      )
    })
    it("Should not verify out of date edges", async () => {
      const rootA = await semaphore1.getRoot(groupIdNum)
      const rootB = await semaphore2.getRoot(groupIdNum)
      const roots = [rootB.toHexString(), rootA.toHexString()]

      const transaction = semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots)
      )
      await expect(transaction).to.be.revertedWith("Neighbour root not found")
    })
    it("Should verify not sequential updates", async () => {
      await semaphore2.updateEdge(
        groupIdNum,
        historicalRootsA[2],
        2,
        toFixedHex(chainIDA, 32)
      )

      const roots = [historicalRootsB[2], historicalRootsA[2]]

      const is_valid = await semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots)
      )
      expect(is_valid).to.equal(true)
    })
  })
  describe("# CrossChainVerify", () => {
    const signal = "Hello world" + Date.now()
    console.log(signal)
    const bytes32Signal = utils.formatBytes32String(signal)

    let fullProof_local_chainA: FullProof
    let solidityProof_local_chainA: SolidityProof
    let chainA_not_updated_roots: string[]

    let groupA2: LinkedGroup
    let groupB2: LinkedGroup

    let fullProof_local_chainB: FullProof
    let solidityProof_local_chainB: SolidityProof
    let chainB_not_updated_roots: string[]
    let historicalRootsA: string[];
    let historicalRootsB: string[];
    const groupId2 = 1337

    before(async () => {

      groupA2 = new LinkedGroup(treeDepth, maxEdges)
      const transactionA = await semaphore1.createGroup(groupId2, treeDepth, accounts[0], maxEdges)

      await expect(transactionA)
        .to.emit(semaphore1.contract, "GroupCreated")
        .withArgs(groupId2, treeDepth)

      await semaphore1.setSigner(signers[0])

      const initialRoot = semaphore1.getRoot(groupId2)
      // const defaultRoot = await semaphore.contract.getLatestNeighborEdges(groupId2)

      // await semaphore1.addMember(groupId2, membersA[0])
      // await semaphore1.addMember(groupId2, membersA[1])
      // await semaphore1.addMember(groupId2, membersA[2])


      historicalRootsA = await AddMembersAndVerifyEvents(
        semaphore1,
        groupId2,
        membersA.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
        groupA2
      )

      expect(groupA2.root).equal(groupA.root)
      expect(await semaphore1.getRoot(groupId2)).equal(groupA2.root)

      groupB2 = new LinkedGroup(treeDepth, maxEdges)
      const transactionB = await semaphore2.createGroup(
        groupId2,
        treeDepth,
        ganacheAdminAddr,
        maxEdges
      )

      historicalRootsB = await AddMembersAndVerifyEvents(
        semaphore2,
        groupId2,
        membersB.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
        groupB2
      )

      const rootA = await semaphore1.getRoot(groupId2)
      const rootB = await semaphore2.getRoot(groupId2)
      // groupA2.updateEdge(chainIDB, historicalRootsB[0])
      fullProof_local_chainA = await generateProof(
        identitiesA[0],
        groupA2,
        BigInt(Date.now() * 100),
        signal,
        BigInt(chainIDA),
        {
          wasmFilePath,
          zkeyFilePath
        }
      )
      solidityProof_local_chainA = await packToSolidityProof(
        fullProof_local_chainA.proof
      )

      // groupB2.updateEdge(chainIDA, initialRoot)
      fullProof_local_chainB = await generateProof(
        identitiesB[2],
        groupB2,
        BigInt(Date.now() * 100),
        signal,
        BigInt(chainIDB),
        {
          wasmFilePath,
          zkeyFilePath
        }
      )

      solidityProof_local_chainB = await packToSolidityProof(
        fullProof_local_chainB.proof
      )
    })

    it("Should verify local proof chainA", async () => {
      const transaction = semaphore1.contract.verifyProof(
        groupId2,
        bytes32Signal,
        fullProof_local_chainA.publicSignals.nullifierHash,
        fullProof_local_chainA.publicSignals.externalNullifier,
        createRootsBytes(fullProof_local_chainA.publicSignals.roots),
        solidityProof_local_chainA,
      )
      await expect(transaction)
        .to.emit(semaphore1.contract, "ProofVerified")
        .withArgs(groupId2, bytes32Signal)
    })

    it("Should verify local proof chainB", async () => {
      const transaction = semaphore2.contract.verifyProof(
        groupId2,
        bytes32Signal,
        fullProof_local_chainB.publicSignals.nullifierHash,
        fullProof_local_chainB.publicSignals.externalNullifier,
        createRootsBytes(fullProof_local_chainB.publicSignals.roots),
        solidityProof_local_chainB,
      )
      await expect(transaction)
        .to.emit(semaphore2.contract, "ProofVerified")
        .withArgs(groupId2, bytes32Signal)
    })

      it("Should verify if edges are updated2", async () => {
        groupA2.addMember(membersA[3])
        const tx4a = semaphore1.addMember(groupId2, membersA[3])
        await expect(tx4a)
          .to.emit(semaphore1.contract, "MemberAdded")
          .withArgs(groupId2, membersA[3], groupA2.root)

        groupB2.addMember(membersB[3])
        const tx4b = semaphore2.addMember(groupId2, membersB[3])
        await expect(tx4b)
          .to.emit(semaphore2.contract, "MemberAdded")
          .withArgs(groupId2, membersB[3], groupB2.root)

        await semaphore2.updateEdge(
          groupId2,
          BigNumber.from(groupA2.root).toHexString(),
          3,
          toFixedHex(chainIDA, 32)
        )

        groupB2.updateEdge(chainIDA, groupA2.root.toString())
        const roots = groupB2.getRoots().map((bignum: BigNumber) => bignum.toString())
        const fullProof = await generateProof(
          identitiesA[0],
          groupA2,
          BigInt(Date.now() * 3),
          signal,
          BigInt(chainIDB),
          {
            wasmFilePath,
            zkeyFilePath
          },
          roots
        )
        const solidityProof = packToSolidityProof(fullProof.proof)

        const transaction = semaphore2.contract
          .verifyProof(
            groupId2,
            bytes32Signal,
            fullProof.publicSignals.nullifierHash,
            fullProof.publicSignals.externalNullifier,
            createRootsBytes(fullProof.publicSignals.roots),
            solidityProof
          )
        await expect(transaction)
          .to.emit(semaphore2.contract, "ProofVerified")
          .withArgs(groupId2, bytes32Signal)
      })
  })
})
