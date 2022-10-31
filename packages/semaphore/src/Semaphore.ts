import {
  BigNumber,
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
  Signer,
  utils,
  ethers
} from "ethers"
import { toHex, toFixedHex } from "@webb-tools/sdk-core"
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { getChainIdType, ZkComponents } from "@webb-tools/utils"
import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { strict as assert } from "assert"
import {
  FullProof,
  generateProof,
  packToSolidityProof
} from "@webb-tools/semaphore-proof"
import { Verifier } from "./Verifier"
import {
  Semaphore as SemaphoreContract,
  Semaphore__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from "../build/typechain"

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods

function createRootsBytes(rootArray: string[] | BigNumberish[]): string {
  let rootsBytes = "0x"
  for (let i = 0; i < rootArray.length; i += 1) {
    rootsBytes += toFixedHex(rootArray[i], 32).substr(2)
  }
  return rootsBytes // root byte string (32 * array.length bytes)
}

export class Semaphore {
  signer: Signer
  contract: SemaphoreContract
  chainId: number
  linkedGroups: Record<number, LinkedGroup>
  rootHistory: Record<number, string>
  // hex string of the connected root
  latestSyncedBlock: number
  // The depositHistory stores leafIndex => information to create proposals (new root)
  smallCircuitZkComponents: ZkComponents
  largeCircuitZkComponents: ZkComponents

  zeroValue: bigint = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )

  constructor(
    contract: SemaphoreContract,
    signer: Signer,
    chainId: number,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents
  ) {
    this.signer = signer
    this.contract = contract
    this.chainId = chainId
    this.latestSyncedBlock = 0
    this.linkedGroups = {}
    this.rootHistory = {}
    // this.rootHistory = undefined;
    this.smallCircuitZkComponents = smallCircuitZkComponents
    this.largeCircuitZkComponents = largeCircuitZkComponents
    this.zeroValue = BigInt(
      "21663839004416932945382355908790599225266501822907911457504978515578255421292"
    )
    // this.largeCircuitZkComponents = largeCircuitZkComponents
  }
  public static async createSemaphore(
    levels: BigNumberish,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: Signer
  ): Promise<Semaphore> {
    const chainId = getChainIdType(await signer.getChainId())

    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)

    const PoseidonLibFactory = new ethers.ContractFactory(
      poseidonABI,
      poseidonBytecode,
      signer
    )
    const poseidonLib = await PoseidonLibFactory.deploy()
    await poseidonLib.deployed()

    const encodeLibraryFactory = new SemaphoreInputEncoder__factory(signer)
    const encodeLibrary = await encodeLibraryFactory.deploy()
    await encodeLibrary.deployed()
    const verifier = await Verifier.createVerifier(signer)
    const linkableTreeFactory = new LinkableIncrementalBinaryTree__factory(
      {
        ["contracts/base/Poseidon.sol:PoseidonT3Lib"]: poseidonLib.address
      },
      signer
    )
    const linkableTree = await linkableTreeFactory.deploy()
    await linkableTree.deployed()
    const factory = new Semaphore__factory(
      {
        ["contracts/base/LinkableIncrementalBinaryTree.sol:LinkableIncrementalBinaryTree"]:
          linkableTree.address,
        ["contracts/base/SemaphoreInputEncoder.sol:SemaphoreInputEncoder"]:
          encodeLibrary.address,
        ["contracts/base/Poseidon.sol:PoseidonT3Lib"]: poseidonLib.address
      },
      signer
    )
    const semaphore = await factory.deploy([
      {
        merkleTreeDepth: BigNumber.from(levels),
        contractAddress: verifier.contract.address
      }
    ])
    await semaphore.deployed()
    const createdSemaphore = new Semaphore(
      semaphore,
      signer,
      chainId,
      smallCircuitZkComponents,
      largeCircuitZkComponents
    )
    return createdSemaphore
    // createdSemaphore.latestSyncedBlock = semaphore.deployTransaction.blockNumber!;
  }

  public static async connect(
    // connect via factory method
    // build up tree by querying provider for logs
    address: string,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: Signer
  ) {
    const chainId = getChainIdType(await signer.getChainId())
    const semaphore = Semaphore__factory.connect(address, signer)
    const createdSemaphore = new Semaphore(
      semaphore,
      signer,
      chainId,
      smallCircuitZkComponents,
      largeCircuitZkComponents
    )
    return createdSemaphore
  }

  public static createRootsBytes(rootArray: string[]) {
    let rootsBytes = "0x"
    for (let i = 0; i < rootArray.length; i += 1) {
      rootsBytes += toFixedHex(rootArray[i]).substr(2)
    }
    return rootsBytes // root byte string (32 * array.length bytes)
  }

  // Convert a hex string to a byte array
  public static hexStringToByte(str: string) {
    if (!str) {
      return new Uint8Array()
    }

    const a = []
    for (let i = 0, len = str.length; i < len; i += 2) {
      a.push(parseInt(str.substr(i, 2), 16))
    }

    return new Uint8Array(a)
  }

  // Sync the local tree with the tree on chain.
  // Start syncing from the given block number, otherwise zero.
  // public async updateState(blockNumber?: number) {
  //   const filter = this.contract.filters.MemberAdded();
  //   const currentBlockNumber = await this.signer.provider!.getBlockNumber();
  //   const events = await this.contract.queryFilter(filter, blockNumber || 0);
  //   const commitments = events.map((event) => event.args.commitment);
  //   this.linkedGroups.addMembers(commitments);
  //   this.latestSyncedBlock = currentBlockNumber;
  // }

  public async updateGroupAdmin(
    groupId: number,
    newAdminAddr: string
  ): Promise<ContractReceipt> {
    const transaction = await this.contract.updateGroupAdmin(
      groupId,
      newAdminAddr,
      { gasLimit: "0x5B8D80" }
    )
    // const transaction = await promise_tx;
    const receipt = await transaction.wait()

    this.linkedGroups[groupId].updateGroupAdmin(newAdminAddr)
    return receipt
  }

  public async createResourceId(): Promise<string> {
    return toHex(
      this.contract.address +
        toHex(getChainIdType(await this.signer.getChainId()), 6).substr(2),
      32
    )
  }

  public async setSigner(newSigner: Signer) {
    const currentChainId = await this.signer.getChainId()
    const newChainId = await newSigner.getChainId()

    if (currentChainId === newChainId) {
      this.signer = newSigner
      this.contract = this.contract.connect(newSigner)
      return true
    }
    return false
  }

  public async getMerkleTreeRoot(groupId: number): Promise<BigNumber> {
    return this.contract.getMerkleTreeRoot(groupId)
  }

  public populateRootsForProof(groupId: number): string[] {
    return this.linkedGroups[groupId]
      .getRoots()
      .map((bignum) => bignum.toString())
  }

  public async createGroup(
    groupId: number,
    depth: number,
    groupAdminAddr: string,
    maxEdges: number,
    merkleRootDuration?: BigNumberish
  ): Promise<ContractTransaction> {
    if (groupId in this.linkedGroups) {
      throw new Error(`Group ${groupId} has already been created`)
    } else {
      this.linkedGroups[groupId] = new LinkedGroup(
        depth,
        maxEdges,
        this.zeroValue,
        groupAdminAddr
      )
      if (merkleRootDuration === undefined) {
        // return this.contract.createGroup(groupId, depth, groupAdminAddr, maxEdges)
        return this.contract["createGroup(uint256,uint256,address,uint8)"](
          groupId,
          depth,
          groupAdminAddr,
          maxEdges
        )
      }
      return this.contract[
        "createGroup(uint256,uint256,address,uint8,uint256)"
      ](groupId, depth, groupAdminAddr, maxEdges, merkleRootDuration.toString())
    }
  }

  public async getClassAndContractRoots(
    groupId: number
  ): Promise<BigNumberish[]> {
    const chainId = getChainIdType(await this.signer.getChainId())
    return [
      this.linkedGroups[groupId].roots[chainId],
      await this.contract.getMerkleTreeRoot(groupId)
    ]
  }

  public async updateLinkedGroup(groupId: number): Promise<string[]> {
    const neighborEdges = await this.contract.getLatestNeighborEdges(groupId)

    neighborEdges.forEach((edge) => {
      this.linkedGroups[groupId].updateEdge(
        edge.chainID.toNumber(),
        edge.root.toString()
      )
    })

    const thisRoot = await this.contract.getMerkleTreeRoot(groupId)
    assert(
      thisRoot.toString() === this.linkedGroups[groupId].root.toString(),
      "Contract and object are out of sync. You should run update()"
    )

    // TODO: Add query and pre-processing of out-of-sync leaves to recreate group and remove above assert
    return [
      thisRoot.toString(),
      ...neighborEdges.map((edge) => edge.root.toString())
    ]
  }

  public async addMembers(
    groupId: number,
    leafs: BigNumberish[]
  ): Promise<ContractTransaction[]> {
    const txs = []
    for (const leaf of leafs) {
      txs.push(await this.addMember(groupId, leaf))
    }
    return txs
  }
  public async addMember(
    groupId: number,
    leaf: BigNumberish
  ): Promise<ContractTransaction> {
    if (!(groupId in this.linkedGroups)) {
      throw new Error(`Group ${groupId} doesn't exist`)
    } else {
      this.linkedGroups[groupId].addMember(leaf)
      return this.contract.addMember(groupId, leaf, { gasLimit: "0x5B8D80" })
    }
  }

  public async updateEdge(
    groupId: number,
    root: string,
    index: number,
    typedChainId: number
  ): Promise<ContractTransaction> {
    const tx = await this.contract.updateEdge(
      groupId,
      root,
      index,
      toFixedHex(typedChainId),
      { gasLimit: "0x5B8D80" }
    )
    this.linkedGroups[groupId].updateEdge(typedChainId, root)

    return tx
  }

  public async verifyRoots(
    groupId: number,
    rootsBytes: string
  ): Promise<boolean> {
    const tx = await this.contract.verifyRoots(groupId, rootsBytes, {
      gasLimit: "0x5B8D80"
    })
    return tx
  }

  public async verifyIdentity(
    identity: Identity,
    signal: string,
    groupId: number,
    chainId: number,
    externalNullifier: BigNumberish,
    externalGroup?: LinkedGroup
  ): Promise<{ transaction: ContractTransaction; fullProof: FullProof }> {
    const bytes32Signal = utils.formatBytes32String(signal)

    let roots: string[]
    if (externalGroup !== undefined) {
      // if externalGroup is being provided we assume it's use
      // on merkle proof generation.
      // externalGroup should have updated roots.
      externalGroup.updateEdge(
        chainId,
        this.linkedGroups[groupId].root.toString()
      )
      roots = externalGroup
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    } else {
      roots = this.linkedGroups[groupId]
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    }
    const zkComponent =
      this.linkedGroups[groupId].maxEdges === 1
        ? this.smallCircuitZkComponents
        : this.largeCircuitZkComponents

    const fullProof = await generateProof(
      identity,
      this.linkedGroups[groupId],
      externalNullifier,
      signal,
      BigInt(chainId),
      zkComponent,
      roots
    )
    const solidityProof = packToSolidityProof(fullProof.proof)

    const transaction = await this.contract.verifyProof(
      groupId,
      bytes32Signal,
      fullProof.publicSignals.nullifierHash,
      fullProof.publicSignals.externalNullifier,
      createRootsBytes(fullProof.publicSignals.roots),
      solidityProof,
      { gasLimit: "0x5B8D80" }
    )

    return { transaction, fullProof }
  }
}

export default Semaphore
