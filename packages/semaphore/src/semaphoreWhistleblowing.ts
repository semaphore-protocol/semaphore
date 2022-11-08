import {
  BigNumber,
  BigNumberish,
  ContractTransaction,
  Signer,
  utils,
  ethers
} from "ethers"
import { toFixedHex } from "@webb-tools/sdk-core"
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { getChainIdType, ZkComponents } from "@webb-tools/utils"
import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import {
  FullProof,
  generateProof,
  createRootsBytes,
  packToSolidityProof
} from "@webb-tools/semaphore-proof"
import { Verifier } from "./verifier"
import { SemaphoreBase } from "./semaphoreBase"
import {
  SemaphoreWhistleblowing as SemaphoreWhistleblowingContract,
  SemaphoreWhistleblowing__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from "../build/typechain"

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods

export class SemaphoreWhistleblowing extends SemaphoreBase {
  contract: SemaphoreWhistleblowingContract

  constructor(
    contract: SemaphoreWhistleblowingContract,
    signer: Signer,
    chainId: number,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents
  ) {
    super(
      contract,
      signer,
      chainId,
      smallCircuitZkComponents,
      largeCircuitZkComponents
    )
    this.contract = contract
    // this.rootHistory = undefined;
    // this.largeCircuitZkComponents = largeCircuitZkComponents
  }
  public static async createSemaphoreWhistleblowing(
    levels: BigNumberish,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: Signer
  ): Promise<SemaphoreWhistleblowing> {
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
    const factory = new SemaphoreWhistleblowing__factory(
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
    const createdSemaphore = new SemaphoreWhistleblowing(
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
    const semaphore = SemaphoreWhistleblowing__factory.connect(address, signer)
    const createdSemaphore = new SemaphoreWhistleblowing(
      semaphore,
      signer,
      chainId,
      smallCircuitZkComponents,
      largeCircuitZkComponents
    )
    return createdSemaphore
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

  public async createEntity(
    entityId: number,
    depth: number,
    editorAddr: string,
    maxEdges: number
  ): Promise<ContractTransaction> {
    if (entityId in this.linkedGroups) {
      throw new Error(`Group ${entityId} has already been created`)
    }
    this.linkedGroups[entityId] = new LinkedGroup(
      depth,
      maxEdges,
      this.zeroValue,
      editorAddr
    )
    return this.contract.createEntity(entityId, depth, editorAddr, maxEdges)
  }

  public async addWhistleblowers(
    entityId: number,
    leafs: BigNumberish[]
  ): Promise<ContractTransaction[]> {
    const txs = []
    for (const leaf of leafs) {
      txs.push(await this.addWhistleblower(entityId, leaf))
    }
    return txs
  }
  public async addWhistleblower(
    entityId: number,
    leaf: BigNumberish
  ): Promise<ContractTransaction> {
    if (!(entityId in this.linkedGroups)) {
      throw new Error(`Group ${entityId} doesn't exist`)
    }
    this.linkedGroups[entityId].addMember(leaf)
    return this.contract.addWhistleblower(entityId, leaf, {
      gasLimit: "0x5B8D80"
    })
  }

  public async updateEdge(
    entityId: number,
    root: string,
    index: number,
    typedChainId: number
  ): Promise<ContractTransaction> {
    const tx = await this.contract.updateEdge(
      entityId,
      root,
      index,
      toFixedHex(typedChainId),
      { gasLimit: "0x5B8D80" }
    )
    this.linkedGroups[entityId].updateEdge(typedChainId, root)

    return tx
  }

  public async verifyRoots(
    entityId: number,
    rootsBytes: string
  ): Promise<boolean> {
    const tx = await this.contract.verifyRoots(entityId, rootsBytes, {
      gasLimit: "0x5B8D80"
    })
    return tx
  }

  public async publishLeak(
    identity: Identity,
    leak: string,
    entityId: number,
    chainId: number,
    externalGroup?: LinkedGroup
  ): Promise<{ transaction: ContractTransaction; fullProof: FullProof }> {
    const bytes32Leak = utils.formatBytes32String(leak)

    let roots: string[]
    if (externalGroup !== undefined) {
      // if externalGroup is being provided we assume it's use
      // on merkle proof generation.
      // externalGroup should have updated roots.
      externalGroup.updateEdge(
        chainId,
        this.linkedGroups[entityId].root.toString()
      )
      roots = externalGroup
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    } else {
      roots = this.linkedGroups[entityId]
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    }
    const zkComponent =
      this.linkedGroups[entityId].maxEdges === 1
        ? this.smallCircuitZkComponents
        : this.largeCircuitZkComponents

    const fullProof = await generateProof(
      identity,
      this.linkedGroups[entityId],
      entityId,
      leak,
      BigInt(chainId),
      zkComponent,
      roots
    )
    const solidityProof = packToSolidityProof(fullProof.proof)

    const transaction = await this.contract.publishLeak(
      bytes32Leak,
      fullProof.publicSignals.nullifierHash,
      entityId,
      createRootsBytes(fullProof.publicSignals.roots),
      solidityProof,
      { gasLimit: "0x5B8D80" }
    )

    return { transaction, fullProof }
  }
}

export default SemaphoreWhistleblowing
