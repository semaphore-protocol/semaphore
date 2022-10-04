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
import { Identity } from "../../packages/identity"
import { LinkedGroup } from "../../packages/group"
import { Semaphore } from "../../packages/semaphore"
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

  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const groupId = 2
  const maxEdges = 1
  const providerA = new providers.JsonRpcProvider("http://127.0.0.1:8545")
  const providerB = new providers.JsonRpcProvider("http://127.0.0.1:8546")
  // const contractAddr = "0xe800b887db490d9523212813a7907afdb7493e45"

  const AddMembersAndVerifyEvents = async (
    semaphore: Semaphore,
    membersToAdd: BigNumber[],
    linkedGroup: LinkedGroup
  ) => {
    const txs = await semaphore.addMembers(groupId, membersToAdd)
    const roots: string[] = []
    for (let i = 0; i < txs.length; i++) {
      linkedGroup.addMember(membersToAdd[i])
      const root = BigNumber.from(linkedGroup.group.root)
      await expect(txs[i])
        .to.emit(semaphore.contract, "MemberAdded")
        .withArgs(groupId, membersToAdd[i], root)

      roots.push(root.toHexString())
    }
    return roots
  }

  const wasmFilePath =
    __dirname + `/../../fixtures/${treeDepth}/2/semaphore_20_2.wasm`
  const witnessCalcPath =
    __dirname + `/../../fixtures/${treeDepth}/2/witness_calculator.js`
  const zkeyFilePath =
    __dirname + `/../../fixtures/${treeDepth}/2/circuit_final.zkey`

  // Cross-chain setup
  const FIRST_CHAIN_ID = 31337
  const hardhatWallet1 = new ethers.Wallet(HARDHAT_PK_1, ethers.provider)

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
    // Starting contracts / accounts
    // contractA = await hreEthers.getContractAt("Semaphore", contractAddr, signersA[1])
    // contractB = await hreEthers.getContractAt("Semaphore", contractAddr, signersB[1])
    ganacheServer2 = await startGanacheServer(
      SECOND_CHAIN_ID,
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

    // chainIDA = await contractA.getChainIdType()
    // chainIDB = await contractB.getChainIdType()
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
      groupId,
      treeDepth,
      hardhatAdminAddr,
      maxEdges
    )

    await expect(transactionA)
      .to.emit(semaphore1.contract, "GroupCreated")
      .withArgs(groupId, treeDepth)

    await expect(transactionA)
      .to.emit(semaphore1.contract, "GroupAdminUpdated")
      .withArgs(groupId, constants.AddressZero, hardhatAdminAddr)
    const rootA = await semaphore1.contract.getRoot(groupId)
    expect(rootA).to.equal(groupA.root)

    const transactionB = semaphore2.createGroup(
      groupId,
      treeDepth,
      ganacheAdminAddr,
      maxEdges
    )
    await expect(transactionB)
      .to.emit(semaphore2.contract, "GroupCreated")
      .withArgs(groupId, treeDepth)
    await expect(transactionB)
      .to.emit(semaphore2.contract, "GroupAdminUpdated")
      .withArgs(groupId, constants.AddressZero, ganacheAdminAddr)
    const rootB = await semaphore2.contract.getRoot(groupId)

    groupB = new LinkedGroup(treeDepth, maxEdges)
    expect(rootB).to.equal(groupB.root)
    allRootsB = [rootB.toHexString()]
    console.log("members slice: ", membersA.slice(0, 3))

    historicalRootsA = await AddMembersAndVerifyEvents(
      semaphore1,
      membersA.slice(0, 3).map((bigint) => BigNumber.from(bigint)),
      groupA
    )

    historicalRootsB = await AddMembersAndVerifyEvents(
      semaphore2,
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
      rootA = await semaphore1.linkedGroups[groupId].getRoots()[0]
      rootB = await semaphore2.linkedGroups[groupId].getRoots()[0]
      roots1 = [rootA.toHexString(), rootB.toHexString()]
      roots2 = [rootB.toHexString(), rootA.toHexString()]
      // roots_zero = [rootA.toHexString(), toFixedHex(0, 32)]
    })
    it("Should not verify if updateEdge has not been called", async () => {
      const signers = await ethers.getSigners()
      const transaction1 = semaphore1.contract.verifyRoots(
        groupId,
        createRootsBytes(roots1)
      )
      await expect(transaction1).to.be.revertedWith(
        "Not initialized edges must be set to 0"
      )

      const transaction2 = semaphore2.contract.verifyRoots(
        groupId,
        createRootsBytes(roots2)
      )
      await expect(transaction2).to.be.revertedWith(
        "Not initialized edges must be set to 0"
      )
    })

    it("Should verify external root after updateEdge", async () => {
      await semaphore2.updateEdge(groupId, historicalRootsA[0], 0, chainIDA)

      const roots = [rootB.toHexString(), historicalRootsA[0]]
      const is_valid = await semaphore2.verifyRoots(
        groupId,
        createRootsBytes(roots)
      )

      expect(is_valid).to.equal(true)
    })
    it("Should not verify invalid order of roots", async () => {
      const transaction1 = semaphore1.verifyRoots(
        groupId,
        createRootsBytes(roots2)
      )
      await expect(transaction1).to.be.revertedWith(
        "Cannot find your merkle root"
      )

      const transaction2 = semaphore2.verifyRoots(
        groupId,
        createRootsBytes(roots1)
      )
      await expect(transaction2).to.be.revertedWith(
        "Cannot find your merkle root"
      )
    })
    it("Should not verify out of date edges", async () => {
      const rootA = await semaphore1.getGroupRoot(groupId)
      const rootB = await semaphore2.getGroupRoot(groupId)
      const roots = [rootB.toHexString(), rootA.toHexString()]

      const transaction = semaphore2.verifyRoots(
        groupId,
        createRootsBytes(roots)
      )
      await expect(transaction).to.be.revertedWith("Neighbour root not found")
    })
    it("Should verify not sequential updates", async () => {
      await semaphore2.updateEdge(
        groupId,
        historicalRootsA[2],
        2,
        toFixedHex(chainIDA, 32)
      )

      const roots = [historicalRootsB[2], historicalRootsA[2]]

      const is_valid = await semaphore2.verifyRoots(
        groupId,
        createRootsBytes(roots)
      )
      expect(is_valid).to.equal(true)
    })
  })
  // describe("# CrossChainVerify", () => {
  //   const signal = "Hello world" + Date.now()
  //   console.log(signal)
  //   const bytes32Signal = utils.formatBytes32String(signal)
  //
  //   let fullProof_local_chainA: FullProof
  //   let solidityProof_local_chainA: SolidityProof
  //   let chainA_not_updated_roots: string[]
  //
  //   let fullProof_local_chainB: FullProof
  //   let solidityProof_local_chainB: SolidityProof
  //   let chainB_not_updated_roots: string[]
  //
  //   before(async () => {
  //     const rootA = await semaphore1.getGroupRoot(groupId)
  //     const rootB = await semaphore2.getGroupRoot(groupId)
  //     chainA_not_updated_roots = [
  //       rootA.toHexString(),
  //       toFixedHex(BigNumber.from(0), 32)
  //     ]
  //     fullProof_local_chainA = await generateProof(
  //       identitiesA[0],
  //       groupA,
  //       BigInt(Date.now() * 100),
  //       signal,
  //       BigInt(chainIDA),
  //       {
  //         wasmFilePath,
  //         zkeyFilePath
  //       }
  //     )
  //     solidityProof_local_chainA = packToSolidityProof(
  //       fullProof_local_chainA.proof
  //     )
  //
  //     chainB_not_updated_roots = [rootB.toHexString(), historicalRootsA[0]]
  //     fullProof_local_chainB = await generateProof(
  //       identitiesB[2],
  //       groupB,
  //       BigInt(Date.now() * 100),
  //       signal,
  //       BigInt(chainIDB),
  //       {
  //         wasmFilePath,
  //         zkeyFilePath
  //       }
  //     )
  //
  //     solidityProof_local_chainB = packToSolidityProof(
  //       fullProof_local_chainB.proof
  //     )
  //   })
  //
  //   it("Should verify local proof chainA", async () => {
  //     semaphore1.setSigner(signers[1])
  //
  //     const transaction = semaphore1.contract
  //       .verifyProof(
  //         groupId,
  //         bytes32Signal,
  //         fullProof_local_chainA.publicSignals.nullifierHash,
  //         fullProof_local_chainA.publicSignals.externalNullifier,
  //         createRootsBytes(fullProof_local_chainA.publicSignals.roots),
  //         solidityProof_local_chainA,
  //         { gasLimit: "0x5B8D80" }
  //       )
  //     await expect(transaction)
  //       .to.emit(semaphore1.contract, "ProofVerified")
  //       .withArgs(groupId, bytes32Signal)
  //   })
  //
  //   it("Should verify local proof chainB", async () => {
  //     const transaction = contractB
  //       .connect(signersB[1])
  //       .verifyProof(
  //         groupId,
  //         bytes32Signal,
  //         fullProof_local_chainB.publicSignals.nullifierHash,
  //         fullProof_local_chainB.publicSignals.externalNullifier,
  //         createRootsBytes(fullProof_local_chainB.publicSignals.roots),
  //         solidityProof_local_chainB
  //       )
  //     await expect(transaction)
  //       .to.emit(contractB, "ProofVerified")
  //       .withArgs(groupId, bytes32Signal)
  //   })
  //
  //   it("Should verify if edges are updated2", async () => {
  //     groupA.addMember(membersA[3])
  //     const tx4a = contractA
  //       .connect(signersA[1])
  //       .addMember(groupId, membersA[3])
  //     await expect(tx4a)
  //       .to.emit(contractA, "MemberAdded")
  //       .withArgs(groupId, membersA[3], groupA.root)
  //
  //     groupB.addMember(membersB[3])
  //     const tx4b = contractB
  //       .connect(signersB[1])
  //       .addMember(groupId, membersB[3])
  //     await expect(tx4b)
  //       .to.emit(contractB, "MemberAdded")
  //       .withArgs(groupId, membersB[3], groupB.root)
  //
  //     await contractB
  //       .connect(signersB[1])
  //       .updateEdge(
  //         groupId,
  //         BigNumber.from(groupA.root).toHexString(),
  //         3,
  //         toFixedHex(chainIDA, 32)
  //       )
  //     const rootA = await contractA.getRoot(groupId)
  //     const rootB = await contractB.getRoot(groupId)
  //
  //     const chainB_roots = [rootB.toHexString(), rootA.toHexString()]
  //     const fullProof = await generateProof(
  //       identitiesA[0],
  //       groupA,
  //       chainB_roots,
  //       BigInt(Date.now() * 3),
  //       signal,
  //       BigInt(chainIDB),
  //       {
  //         wasmFilePath,
  //         zkeyFilePath
  //       }
  //     )
  //     const solidityProof = packToSolidityProof(fullProof.proof)
  //
  //     const transaction = contractB
  //       .connect(signersB[1])
  //       .verifyProof(
  //         groupId,
  //         bytes32Signal,
  //         fullProof.publicSignals.nullifierHash,
  //         fullProof.publicSignals.externalNullifier,
  //         createRootsBytes(fullProof.publicSignals.roots),
  //         solidityProof
  //       )
  //     await expect(transaction)
  //       .to.emit(contractB, "ProofVerified")
  //       .withArgs(groupId, bytes32Signal)
  //   })
  // })
})
