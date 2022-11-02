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
  packToSolidityProof
} from "@webb-tools/semaphore-proof"
import { Verifier } from "./verifier"
import { SemaphoreBase, createRootsBytes } from "./semaphoreBase"
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
    if (groupId in this.linkedGroups) {
      throw new Error(`Group ${groupId} has already been created`)
    }
    const tx = await this.contract.createPoll(
      groupId,
      depth,
      groupAdminAddr,
      maxEdges
    )
    this.linkedGroups[groupId] = new LinkedGroup(
      depth,
      maxEdges,
      this.zeroValue,
      groupAdminAddr
    )
    return tx
  }

  public async getNumberVoters(pollId: BigNumberish): Promise<BigNumberish> {
    return super.getNumberOfMerkleTreeLeaves(pollId)
  }

  public async addVoters(
    groupId: number,
    leafs: BigNumberish[]
  ): Promise<ContractTransaction[]> {
    const txs = []
    for (const leaf of leafs) {
      txs.push(await this.addVoter(groupId, leaf))
    }
    return txs
  }
  public async addVoter(
    groupId: number,
    leaf: BigNumberish
  ): Promise<ContractTransaction> {
    if (!(groupId in this.linkedGroups)) {
      throw new Error(`Group ${groupId} doesn't exist`)
    }
    const tx = await this.contract.addVoter(groupId, leaf, {
      gasLimit: "0x5B8D80"
    })
    this.linkedGroups[groupId].addMember(leaf)

    return tx
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

    let roots: string[]
    if (externalGroup !== undefined) {
      // if externalGroup is being provided we assume it's use
      // on merkle proof generation.
      // externalGroup should have updated roots.
      externalGroup.updateEdge(
        chainId,
        this.linkedGroups[pollId].root.toString()
      )
      roots = externalGroup
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    } else {
      roots = this.linkedGroups[pollId]
        .getRoots()
        .map((bignum: BigNumber) => bignum.toString())
    }
    const zkComponent =
      this.linkedGroups[pollId].maxEdges === 1
        ? this.smallCircuitZkComponents
        : this.largeCircuitZkComponents

    const fullProof = await generateProof(
      identity,
      this.linkedGroups[pollId],
      pollId,
      signal,
      BigInt(chainId),
      zkComponent,
      roots
    )
    const solidityProof = packToSolidityProof(fullProof.proof)

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
