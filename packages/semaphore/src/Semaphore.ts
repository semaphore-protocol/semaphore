import { BigNumber, BigNumberish, ContractReceipt, ContractTransaction, Signer, ethers } from 'ethers';
import {
  Semaphore as SemaphoreContract,
  Semaphore__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from '../typechain';
import {
  toHex,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { getChainIdType, ZkComponents } from '@webb-tools/utils';
import { LinkedGroup } from '@webb-tools/semaphore-group/src';
import { Verifier } from './Verifier';

const assert = require('assert');

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods
export class Semaphore {
  signer: Signer;
  contract: SemaphoreContract;
  linkedGroups: Record<number, LinkedGroup>;
  rootHistory: Record<number, string>;
  // hex string of the connected root
  latestSyncedBlock: number;
  // The depositHistory stores leafIndex => information to create proposals (new root)
  smallCircuitZkComponents: ZkComponents;
  zeroValue: bigint;

  constructor(
    contract: SemaphoreContract,
    signer: Signer,
    maxEdges: number,
    smallCircuitZkComponents: ZkComponents,
  ) {
    this.signer = signer;
    this.contract = contract;
    this.latestSyncedBlock = 0;
    this.linkedGroups = {}
    this.rootHistory = {}
    // this.rootHistory = undefined;
    this.smallCircuitZkComponents = smallCircuitZkComponents
    this.zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    // this.largeCircuitZkComponents = largeCircuitZkComponents
  }
  public static async createSemaphore(
    levels: BigNumberish,
    maxEdges: number,
    smallCircuitZkComponents: ZkComponents,
    signer: Signer
  ): Promise<Semaphore> {
    const encodeLibraryFactory = new SemaphoreInputEncoder__factory(signer);
    const encodeLibrary = await encodeLibraryFactory.deploy();
    await encodeLibrary.deployed();
    const verifier = await Verifier.createVerifier(signer)
    const linkableTreeFactory = new LinkableIncrementalBinaryTree__factory(signer)
    const linkableTree = await linkableTreeFactory.deploy();
    await linkableTree.deployed()
    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)

    const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
    const poseidonLib = await PoseidonLibFactory.deploy()

    await poseidonLib.deployed()
    const factory = new Semaphore__factory(
      { ['contracts/base/SemaphoreInputEncoder.sol:SemaphoreInputEncoder']: encodeLibrary.address,
      ['contracts/base/LinkableIncrementalBinaryTree.sol:LinkableIncrementalBinaryTree']: linkableTree.address,
      ["@zk-kit/incremental-merkle-tree.sol/Hashes.sol:PoseidonT3"]: poseidonLib.address, },
      signer
    );
    const semaphore = await factory.deploy([{merkleTreeDepth: BigNumber.from(levels), contractAddress: verifier.contract.address}]);
    await semaphore.deployed();
    const createdSemaphore = new Semaphore(
      semaphore,
      signer,
      maxEdges,
      smallCircuitZkComponents,
    );
    return createdSemaphore;
    // createdSemaphore.latestSyncedBlock = semaphore.deployTransaction.blockNumber!;
  }

  public static async connect(
    // connect via factory method
    // build up tree by querying provider for logs
    address: string,
    smallCircuitZkComponents: ZkComponents,
    maxEdges: number,
    signer: Signer
  ) {
    const semaphore = Semaphore__factory.connect(address, signer);
    const createdSemaphore = new Semaphore(
      semaphore,
      signer,
      maxEdges,
      smallCircuitZkComponents,
    );
    return createdSemaphore;
  }

  public static createRootsBytes(rootArray: string[]) {
    let rootsBytes = '0x';
    for (let i = 0; i < rootArray.length; i++) {
      rootsBytes += toFixedHex(rootArray[i]).substr(2);
    }
    return rootsBytes; // root byte string (32 * array.length bytes)
  }

  // Convert a hex string to a byte array
  public static hexStringToByte(str: string) {
    if (!str) {
      return new Uint8Array();
    }

    const a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
      a.push(parseInt(str.substr(i, 2), 16));
    }

    return new Uint8Array(a);
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

  public async updateGroupAdmin(groupId: number, newAdminAddr: string): Promise<ContractReceipt> {
    const transaction = await this.contract.updateGroupAdmin(groupId, newAdminAddr,{ gasLimit: '0x5B8D80' })
      // const transaction = await promise_tx;
    const receipt = await transaction.wait()

    this.linkedGroups[groupId].updateGroupAdmin(newAdminAddr)
    return receipt
  }

  public async createResourceId(): Promise<string> {
    return toHex(this.contract.address + toHex(getChainIdType(await this.signer.getChainId()), 6).substr(2), 32);
  }

  public async setSigner(newSigner: Signer) {
    const currentChainId = await this.signer.getChainId();
    const newChainId = await newSigner.getChainId();

    if (currentChainId === newChainId) {
      this.signer = newSigner;
      this.contract = this.contract.connect(newSigner);
      return true;
    }
    return false;
  }

  public populateRootsForProof(groupId: number): string[] {
    return this.linkedGroups[groupId].getRoots().map((bignum) => bignum.toString())
  }

  public async createGroup(groupId: number, depth: number, groupAdminAddr: string, maxEdges: number): Promise<ContractTransaction> {
      if(groupId in this.linkedGroups) {
        throw new Error(`Group ${groupId} has already been created`);
      } else {
        this.linkedGroups[groupId] = new LinkedGroup(depth, maxEdges, groupAdminAddr)
        return this.contract.createGroup(groupId, depth, groupAdminAddr, maxEdges)
      }
  }

  public async getClassAndContractRoots(groupId: number): Promise<BigNumberish[]> {
    const chainId = getChainIdType(await this.signer.getChainId())
    return [this.linkedGroups[groupId].roots[chainId], await this.contract.getRoot(groupId)];
  }

  public async updateLinkedGroup(groupId: number): Promise<string[]> {
    const neighborEdges = await this.contract.getLatestNeighborEdges(groupId);

    neighborEdges.map((edge) => {
      this.linkedGroups[groupId].updateEdge(edge.chainID.toNumber(), edge.root)
    });

    const thisRoot = await this.contract.getRoot(groupId);
    assert(thisRoot.toString() == this.linkedGroups[groupId].root.toString(), "Contract and object are out of sync. You should run update()")

    // TODO: Add query and pre-processing of out-of-sync leaves to recreate group and remove above assert

    return [thisRoot.toString(), ...neighborEdges.map((edge) => edge.root)];
  }

  public async addMember(groupId: number, leaf: BigNumberish): Promise<ContractTransaction> {
      if(!(groupId in this.linkedGroups)) {
        throw new Error(`Group ${groupId} doesn't exist`);
      } else {
        this.linkedGroups[groupId].addMember(leaf)
        return this.contract.addMember(groupId, leaf, { gasLimit: '0x5B8D80' });
      }
  }
}

export default Semaphore;
