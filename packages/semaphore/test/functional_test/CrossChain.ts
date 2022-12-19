import { expect } from "chai"
import { constants, Signer, utils, BigNumber } from "ethers"
import { ethers } from "hardhat"
import { Identity } from "@webb-tools/semaphore-identity"
import { HARDHAT_ACCOUNTS } from "../../hardhatAccounts.js"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { fetchComponentsFromFilePaths, getChainIdType } from "@webb-tools/utils"
import {
  FullProof,
  generateProof,
  packToSolidityProof,
  SolidityProof
} from "@webb-tools/semaphore-proof"

import { Semaphore } from "../../src"
import { Deployer } from "../../src/deployer"
import { DeterministicDeployFactory__factory } from "../../build/typechain"
import {
  startGanacheServer,
  toFixedHex,
  createRootsBytes,
  createIdentities
} from "../utils"

const path = require("path")

// const sleep = (ms: number) => , zeroValuenew Promise((r) => setTimeout(r, ms))

describe("2-sided CrossChain tests", () => {
  let semaphore1: Semaphore
  let semaphore2: Semaphore

  let accounts: string[]
  let groupA: LinkedGroup
  let groupB: LinkedGroup

  let hardhatAdminAddr: string
  let ganacheAdminAddr: string
  let hardhatAdmin: Signer

  let membersA: bigint[]
  let membersB: bigint[]
  let identitiesA: Identity[]
  let identitiesB: Identity[]
  const groupIdNum = 2

  const zeroValue = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const maxEdges = 1

  const AddMembersAndVerifyEvents = async (
    semaphore: Semaphore,
    numb: number,
    membersToAdd: BigNumber[],
    linkedGroup: LinkedGroup
  ): Promise<string[]> => {
    // const txs = await semaphore.addMembers(groupId, membersToAdd)
    const roots: string[] = [
      BigNumber.from(semaphore.linkedGroups[numb].root).toHexString()
    ]
    for (let i = 0; i < membersToAdd.length; i += 1) {
      const index = semaphore.linkedGroups[numb].members.length
      const tx = await semaphore.addMember(numb, membersToAdd[i])
      await linkedGroup.addMember(membersToAdd[i])
      const root = BigNumber.from(semaphore.linkedGroups[numb].root)
      await expect(tx)
        .emit(semaphore.contract, "MemberAdded")
        .withArgs(numb, index, membersToAdd[i], root)
      await expect(linkedGroup.root).equals(root)

      roots.push(root.toHexString())
    }
    return roots
  }

  const wasmFilePath = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  )
  const witnessCalcPath = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/witness_calculator.js`
  )
  const zkeyFilePath = path.join(
    __dirname,
    `/../../solidity-fixtures/solidity-fixtures/${treeDepth}/2/circuit_final.zkey`
  )

  // Cross-chain setup
  const FIRST_CHAIN_ID = 1337
  // const hardhatWallet1 = new ethers.Wallet(HARDHAT_PK_1, ethers.provider)

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
  let historicalRootsA: string[]
  let historicalRootsB: string[]
  let signers: Signer[]
  let ganacheServer2: any

  before(async () => {
    ganacheServer2 = await startGanacheServer(
      SECOND_CHAIN_PORT,
      SECOND_CHAIN_ID,
      [
        {
          balance: "0x1000000000000000000000",
          secretKey:
            "0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e"
        },
        {
          balance: "0x1000000000000000000000",
          secretKey: "0x" + HARDHAT_ACCOUNTS[0].privateKey
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
    let ganacheDeployerWallet = new ethers.Wallet(
      HARDHAT_ACCOUNTS[0].privateKey,
      ganacheProvider2
    )

    const zkComponents2_2 = await fetchComponentsFromFilePaths(
      wasmFilePath,
      witnessCalcPath,
      zkeyFilePath
    )
    if (hardhatAdmin.provider === undefined) {
      throw new Error("Hardhat provider is undefined")
    }
    console.log(hardhatAdmin.provider.getTransactionCount)
    let hardhatNonce = await hardhatAdmin.provider.getTransactionCount(
      await hardhatAdmin.getAddress(),
      "latest"
    )
    let ganacheNonce = await ganacheDeployerWallet.provider.getTransactionCount(
      ganacheDeployerWallet.address,
      "latest"
    )
    while (ganacheNonce !== hardhatNonce) {
      if (ganacheNonce < hardhatNonce) {
        const Deployer2 = new DeterministicDeployFactory__factory(
          ganacheDeployerWallet
        )
        let deployer2 = await Deployer2.deploy()
        await deployer2.deployed()
        console.log("WHILE Deployer2 deployed to ", deployer2.address)
      } else {
        const Deployer1 = new DeterministicDeployFactory__factory(hardhatAdmin)
        let deployer1 = await Deployer1.deploy()
        await deployer1.deployed()
        console.log("WHILE Deployer1 deployed to ", deployer1.address)
      }

      hardhatNonce = await hardhatAdmin.provider.getTransactionCount(
        await hardhatAdmin.getAddress(),
        "latest"
      )
      ganacheNonce = await ganacheDeployerWallet.provider.getTransactionCount(
        ganacheDeployerWallet.address,
        "latest"
      )
      if (ganacheNonce === hardhatNonce) {
        break
      }
    }
    expect(ganacheNonce).eq(hardhatNonce)
    console.log("hardhat addr ", await hardhatAdmin.getAddress())
    console.log("ganache addr ", await ganacheDeployerWallet.getAddress())
    const Deployer2 = new DeterministicDeployFactory__factory(
      ganacheDeployerWallet
    )
    let deployer2Contract = await Deployer2.deploy()
    await deployer2Contract.deployed()
    let deployer2 = new Deployer(deployer2Contract)
    console.log("Deployer2 deployed to ", deployer2Contract.address)

    const Deployer1 = new DeterministicDeployFactory__factory(hardhatAdmin)
    let deployer1Contract = await Deployer1.deploy()
    await deployer1Contract.deployed()
    let deployer1 = new Deployer(deployer1Contract)
    console.log("Deployer1 deployed to ", deployer1.address)
    const salt = "666"
    const saltHex = ethers.utils.id(salt)
    semaphore1 = await Semaphore.create2Semaphore(
      deployer1,
      saltHex,
      treeDepth,
      zkComponents2_2,
      zkComponents2_2,
      hardhatAdmin
    )
    if (semaphore1.signer.provider !== undefined) {
      console.info(
        `Semaphore 1 has been deployed to ${semaphore1.contract.address} with signer: `,
        await semaphore1.signer.getAddress()
      )
    }

    await ganacheProvider2.ready

    semaphore2 = await Semaphore.create2Semaphore(
      deployer2,
      saltHex,
      treeDepth,
      zkComponents2_2,
      zkComponents2_2,
      ganacheAdmin
    )
    if (semaphore2.signer.provider !== undefined) {
      console.info(
        `Semaphore 2 has been deployed to ${semaphore2.contract.address} with signer: `,
        await semaphore2.signer.getAddress()
      )
    }

    // Creating members
    const idsA = createIdentities(5)
    const idsB = createIdentities(5)
    membersA = idsA.members
    identitiesA = idsA.identities
    membersB = idsB.members
    identitiesB = idsB.identities

    // Creating group on-chain and locally
    groupA = new LinkedGroup(treeDepth, maxEdges, zeroValue)
    const transactionA = semaphore1.createGroup(
      groupIdNum,
      treeDepth,
      hardhatAdminAddr,
      maxEdges
    )

    await expect(transactionA)
      .emit(semaphore1.contract, "GroupCreated")
      .withArgs(groupIdNum, treeDepth, groupA.root)

    await expect(transactionA)
      .emit(semaphore1.contract, "GroupAdminUpdated")
      .withArgs(groupIdNum, constants.AddressZero, hardhatAdminAddr)
    const rootA = await semaphore1.contract.getMerkleTreeRoot(groupIdNum)
    expect(rootA).equal(groupA.root)

    groupB = new LinkedGroup(treeDepth, maxEdges, zeroValue)

    const transactionB = semaphore2.createGroup(
      groupIdNum,
      treeDepth,
      ganacheAdminAddr,
      maxEdges
    )
    await expect(transactionB)
      .emit(semaphore2.contract, "GroupCreated")
      .withArgs(groupIdNum, treeDepth, groupB.root)
    await expect(transactionB)
      .emit(semaphore2.contract, "GroupAdminUpdated")
      .withArgs(groupIdNum, constants.AddressZero, ganacheAdminAddr)
    const rootB = await semaphore2.contract.getMerkleTreeRoot(groupIdNum)

    expect(rootB).equal(groupB.root)
    console.info("members slice: ", membersA.slice(0, 3))

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
    let rootA: BigNumber
    let rootB: BigNumber

    before(async () => {
      rootA = semaphore1.linkedGroups[groupIdNum].getRoots()[0]
      rootB = semaphore2.linkedGroups[groupIdNum].getRoots()[0]

      roots1 = [
        toFixedHex(rootA.toHexString()),
        toFixedHex(rootB.toHexString())
      ]
      roots2 = [
        toFixedHex(rootB.toHexString()),
        toFixedHex(rootA.toHexString())
      ]
      // roots_zero = [rootA.toHexString(), toFixedHex(0, 32)]
    })
    it("Should not verify if updateEdge has not been called", async () => {
      const transaction1 = semaphore1.contract.verifyRoots(
        groupIdNum,
        createRootsBytes(roots1)
      )
      await expect(transaction1).revertedWith(
        "non-existent edge is not set to the default root"
      )

      const transaction2 = semaphore2.contract.verifyRoots(
        groupIdNum,
        createRootsBytes(roots2)
      )
      await expect(transaction2).revertedWith(
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

      expect(is_valid).equal(true)
    })
    it("Should not verify invalid order of roots", async () => {
      const transaction1 = semaphore1.verifyRoots(
        groupIdNum,
        createRootsBytes(roots2)
      )
      await expect(transaction1).revertedWith("Cannot find your merkle root")

      const transaction2 = semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots1)
      )
      await expect(transaction2).revertedWith("Cannot find your merkle root")
    })
    it("Should not verify out of date edges", async () => {
      const updatedRootA = await semaphore1.getMerkleTreeRoot(groupIdNum)
      const updatedRootB = await semaphore2.getMerkleTreeRoot(groupIdNum)
      const roots = [updatedRootB.toHexString(), updatedRootA.toHexString()]

      const transaction = semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots)
      )
      await expect(transaction).revertedWith("Neighbour root not found")
    })
    it("Should verify not sequential updates", async () => {
      await semaphore2.updateEdge(groupIdNum, historicalRootsA[2], 2, chainIDA)

      const roots = [historicalRootsB[2], historicalRootsA[2]]

      const is_valid = await semaphore2.verifyRoots(
        groupIdNum,
        createRootsBytes(roots)
      )
      expect(is_valid).equal(true)
    })
  })
  describe("# CrossChainVerify", () => {
    const signal = "Hello world ".concat(Date.now().toString())
    console.info(signal)
    const bytes32Signal = utils.formatBytes32String(signal)

    let fullProof_local_chainA: FullProof
    let solidityProof_local_chainA: SolidityProof

    let groupA2: LinkedGroup
    let groupB2: LinkedGroup

    let fullProof_local_chainB: FullProof
    let solidityProof_local_chainB: SolidityProof
    const groupId2 = 1337

    before(async () => {
      groupA2 = new LinkedGroup(treeDepth, maxEdges, zeroValue)
      const transactionA = await semaphore1.createGroup(
        groupId2,
        treeDepth,
        accounts[0],
        maxEdges
      )

      await expect(transactionA)
        .emit(semaphore1.contract, "GroupCreated")
        .withArgs(groupId2, treeDepth, groupA2.root)

      await semaphore1.setSigner(signers[0])

      historicalRootsA = await AddMembersAndVerifyEvents(
        semaphore1,
        groupId2,
        membersA.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
        groupA2
      )

      expect(groupA2.root).equal(groupA.root)
      expect(await semaphore1.getMerkleTreeRoot(groupId2)).equal(groupA2.root)

      groupB2 = new LinkedGroup(treeDepth, maxEdges, zeroValue)
      const transactionB = await semaphore2.createGroup(
        groupId2,
        treeDepth,
        ganacheAdminAddr,
        maxEdges
      )

      await expect(transactionB)
        .emit(semaphore2.contract, "GroupCreated")
        .withArgs(groupId2, treeDepth, groupB2.root)

      historicalRootsB = await AddMembersAndVerifyEvents(
        semaphore2,
        groupId2,
        membersB.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
        groupB2
      )

      expect(groupB2.root).equal(groupB.root)
      expect(await semaphore2.getMerkleTreeRoot(groupId2)).equal(groupB2.root)

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
        solidityProof_local_chainA
      )

      await expect(transaction)
        .emit(semaphore1.contract, "ProofVerified")
        .withArgs(
          groupId2,
          groupA2.root,
          fullProof_local_chainA.publicSignals.nullifierHash,
          fullProof_local_chainA.publicSignals.externalNullifier,
          bytes32Signal
        )
    })

    it("Should verify local proof chainB", async () => {
      const transaction = semaphore2.contract.verifyProof(
        groupId2,
        bytes32Signal,
        fullProof_local_chainB.publicSignals.nullifierHash,
        fullProof_local_chainB.publicSignals.externalNullifier,
        createRootsBytes(fullProof_local_chainB.publicSignals.roots),
        solidityProof_local_chainB
      )
      await expect(transaction)
        .emit(semaphore2.contract, "ProofVerified")
        .withArgs(
          groupId2,
          groupB2.root,
          fullProof_local_chainB.publicSignals.nullifierHash,
          fullProof_local_chainB.publicSignals.externalNullifier,
          bytes32Signal
        )
    })

    it("Should verify if edges are updated", async () => {
      groupA2.addMember(membersA[3])
      const tx4a = semaphore1.addMember(groupId2, membersA[3])
      await expect(tx4a)
        .emit(semaphore1.contract, "MemberAdded")
        .withArgs(groupId2, 3, membersA[3], groupA2.root)

      groupB2.addMember(membersB[3])
      const tx4b = semaphore2.addMember(groupId2, membersB[3])
      await expect(tx4b)
        .emit(semaphore2.contract, "MemberAdded")
        .withArgs(groupId2, 3, membersB[3], groupB2.root)

      await semaphore2.updateEdge(
        groupId2,
        BigNumber.from(groupA2.root).toHexString(),
        3,
        chainIDA
      )

      groupB2.updateEdge(chainIDA, groupA2.root.toString())
      const roots = groupB2
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
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

      const transaction = await semaphore2.contract.verifyProof(
        groupId2,
        bytes32Signal,
        fullProof.publicSignals.nullifierHash,
        fullProof.publicSignals.externalNullifier,
        createRootsBytes(fullProof.publicSignals.roots),
        solidityProof
      )

      await expect(transaction)
        .emit(semaphore2.contract, "ProofVerified")
        .withArgs(
          groupId2,
          // TODO: This is bugged. Should be groupA2 instead
          groupB2.root,
          fullProof.publicSignals.nullifierHash,
          fullProof.publicSignals.externalNullifier,
          bytes32Signal
        )
    })
  })

  after("terminate networks", async () => {
    await ganacheServer2.close()
  })
})
