import {
  BigNumber,
  BigNumberish,
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
  SemaphoreVoting as SemaphoreVotingContract,
  SemaphoreVoting__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from "../build/typechain"

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods

export class SemaphoreVoting extends SemaphoreBase {
  contract: SemaphoreVotingContract

  constructor(
    contract: SemaphoreVotingContract,
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
  }
  public static async createSemaphoreVoting(
    levels: BigNumberish,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: Signer
  ): Promise<SemaphoreVoting> {
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
    const factory = new SemaphoreVoting__factory(
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
    const createdSemaphore = new SemaphoreVoting(
      semaphore,
      signer,
      chainId,
      smallCircuitZkComponents,
      largeCircuitZkComponents
    )
    return createdSemaphore
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
    const semaphore = SemaphoreVoting__factory.connect(address, signer)
    const createdSemaphore = new SemaphoreVoting(
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

  public async createPoll(
    groupId: number,
    depth: number,
    groupAdminAddr: string,
    maxEdges: number
  ): Promise<ContractTransaction> {
    return this._createGroup(
      groupId,
      depth,
      groupAdminAddr,
      maxEdges,
      this.contract.createPoll
    )
  }

  public async getNumberOfVoters(pollId: BigNumberish): Promise<BigNumberish> {
    return super.getNumberOfMerkleTreeLeaves(pollId)
  }

  public async addVoters(
    pollId: number,
    leafs: BigNumberish[]
  ): Promise<ContractTransaction[]> {
    const txs = []
    for (const leaf of leafs) {
      txs.push(await this.addVoter(pollId, leaf))
    }
    return txs
  }
  public async addVoter(
    pollId: number,
    leaf: BigNumberish
  ): Promise<ContractTransaction> {
    return this._addMember(pollId, leaf, this.contract.addVoter)
  }

  public async startPoll(
    pollId: number | BigNumberish,
    encryptionKey: BigNumberish
  ): Promise<ContractTransaction> {
    const tx = await this.contract.startPoll(pollId, encryptionKey)
    return tx
  }

  public async endPoll(
    pollId: number | BigNumberish,
    decryptionKey: BigNumberish
  ): Promise<ContractTransaction> {
    const tx = await this.contract.endPoll(pollId, decryptionKey)
    return tx
  }

  public async castVote(
    identity: Identity,
    signal: string,
    pollId: number,
    chainId: number,
    externalGroup?: LinkedGroup
  ): Promise<{ transaction: ContractTransaction; fullProof: FullProof }> {
    const bytes32Vote = utils.formatBytes32String(signal)

    const { fullProof, solidityProof } = await this.setupTransaction(
      identity,
      signal,
      pollId,
      chainId,
      undefined,
      externalGroup
    )

    const transaction = await this.contract.castVote(
      bytes32Vote,
      fullProof.publicSignals.nullifierHash,
      pollId,
      createRootsBytes(fullProof.publicSignals.roots),
      solidityProof,
      { gasLimit: "0x5B8D80" }
    )

    return { transaction, fullProof }
  }
}

export default SemaphoreVoting
