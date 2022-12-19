import {
  BigNumber,
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
  Signer,
  utils,
  ethers
} from "ethers"
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { getChainIdType, ZkComponents } from "@webb-tools/utils"
import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { FullProof, createRootsBytes } from "@webb-tools/semaphore-proof"
import { Verifier } from "./verifier"
import { SemaphoreBase } from "./semaphoreBase"
import {
  Semaphore as SemaphoreContract,
  Semaphore__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from "../build/typechain"
import { Deployer } from "./deployer"

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods

export class Semaphore extends SemaphoreBase {
  contract: SemaphoreContract

  constructor(
    contract: SemaphoreContract,
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
  public static async create2Semaphore(
    deployer: Deployer,
    saltHex: string,
    levels: BigNumberish,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: Signer
  ): Promise<Semaphore> {
    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)
    const poseidonInitCode = poseidonBytecode + Deployer.encode([], [])
    const { address: poseidonLibAddr } = await deployer.deployInitCode(
      saltHex,
      signer,
      poseidonInitCode
    )

    const { contract: encodeLibrary } = await deployer.deploy(
      SemaphoreInputEncoder__factory,
      saltHex,
      signer
    )

    const LinkableIncrementalBinaryTreeLibs = {
      ["contracts/base/Poseidon.sol:PoseidonT3Lib"]: poseidonLibAddr
    }
    const { contract: linkableIncrementalBinaryTree } = await deployer.deploy(
      LinkableIncrementalBinaryTree__factory,
      saltHex,
      signer,
      LinkableIncrementalBinaryTreeLibs
    )

    const chainId = getChainIdType(await signer.getChainId())

    const verifier = await Verifier.create2Verifier(deployer, saltHex, signer)
    const libraryAddresses = {
      ["contracts/base/LinkableIncrementalBinaryTree.sol:LinkableIncrementalBinaryTree"]:
        linkableIncrementalBinaryTree.address,
      ["contracts/base/SemaphoreInputEncoder.sol:SemaphoreInputEncoder"]:
        encodeLibrary.address,
      ["contracts/base/Poseidon.sol:PoseidonT3Lib"]: poseidonLibAddr
    }
    const argTypes = ["address[]", "uint256[]"]
    const args = [[verifier.contract.address], [levels]]
    const { contract: semaphore, receipt } = await deployer.deploy(
      Semaphore__factory,
      saltHex,
      signer,
      libraryAddresses,
      argTypes,
      args
    )
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
    const semaphore = await factory.deploy(
        [verifier.contract.address],
        [BigNumber.from(levels)]
    );

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

  public async createGroup(
    groupId: number,
    depth: number,
    groupAdminAddr: string,
    maxEdges: number,
    merkleRootDuration?: BigNumberish
  ): Promise<ContractTransaction> {
    if (merkleRootDuration === undefined) {
      return this._createGroup(
        groupId,
        depth,
        groupAdminAddr,
        maxEdges,
        this.contract["createGroup(uint256,uint256,address,uint8)"]
      )
    }
    return this._createGroup(
      groupId,
      depth,
      groupAdminAddr,
      maxEdges,
      this.contract["createGroup(uint256,uint256,address,uint8,uint256)"],
      merkleRootDuration
    )
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
    return this._addMember(groupId, leaf, this.contract.addMember)
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

    const { fullProof, solidityProof } = await this.setupTransaction(
      identity,
      signal,
      groupId,
      chainId,
      externalNullifier,
      externalGroup
    )
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
