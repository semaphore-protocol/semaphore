import { BigNumber, BigNumberish, ContractTransaction, Signer, ethers } from 'ethers';
import path from "path";
import {
  Semaphore as SemaphoreContract,
  Verifier20_2__factory,
  Verifier20_7__factory,
  Semaphore__factory,
  SemaphoreVerifier__factory,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from '../typechain';
import {
  toHex,
  Keypair,
  toFixedHex,
  Utxo,
  CircomProvingManager,
  ProvingManagerSetupInput,
  Note,
  NoteGenInput,
  FIELD_SIZE,
} from '@webb-tools/sdk-core';
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
// import {
//   IAnchorDeposit,
//   IAnchor,
//   IVariableAnchorExtData,
//   IVariableAnchorPublicInputs,
//   IAnchorDepositInfo,
// } from '@webb-tools/interfaces';
import { getChainIdType, ZkComponents } from '@webb-tools/utils';
import { Group } from '@semaphore-anchor/group/src';
import { Verifier } from './Verifier';

const zeroAddress = '0x0000000000000000000000000000000000000000';
function checkNativeAddress(tokenAddress: string): boolean {
  if (tokenAddress === zeroAddress || tokenAddress === '0') {
    return true;
  }
  return false;
}

export type Commitment = {
    value: BigNumberish;
    index: number;
}
export type Secret = {
    identityNullifier: BigNumberish;
    identityTrapdoor: BigNumberish;
}
export type PublicInputs = {
    value: string
}

export const gasBenchmark = [];
export const proofTimeBenchmark = [];
// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods
export class Semaphore {
  signer: Signer;
  contract: SemaphoreContract;
  groups: Record<number, Group>;
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
    this.groups = {}
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

  // public static async generateCommitment(input: Secret): Promise<Utxo> {
  //   return CircomUtxo.generateUtxo(input);
  // }

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

  // public static convertToPublicInputsStruct(args: any[]): PublicInputs {
  //   return {
  //     proof: args[0],
  //     roots: args[1],
  //     inputNullifiers: args[2],
  //     outputCommitments: args[3],
  //     publicAmount: args[4],
  //     extDataHash: args[5],
  //   };
  // }
  // Sync the local tree with the tree on chain.
  // Start syncing from the given block number, otherwise zero.
  // public async update(blockNumber?: number) {
  //   const filter = this.contract.filters.Deposit();
  //   const currentBlockNumber = await this.signer.provider!.getBlockNumber();
  //   const events = await this.contract.queryFilter(filter, blockNumber || 0);
  //   const commitments = events.map((event) => event.args.commitment);
  //   this.tree.batch_insert(commitments);
  //   this.latestSyncedBlock = currentBlockNumber;
  // }

  public async createResourceId(): Promise<string> {
    return toHex(this.contract.address + toHex(getChainIdType(await this.signer.getChainId()), 6).substr(2), 32);
  }

  // public async setVerifier(verifierAddress: string) {
  //   const tx = await this.contract.setVerifier(
  //     verifierAddress,
  //     BigNumber.from(await this.contract.getProposalNonce()).add(1)
  //   );
  //   await tx.wait();
  // }

  // public async setHandler(handlerAddress: string) {
  //   const tx = await this.contract.setHandler(
  //     handlerAddress,
  //     BigNumber.from(await this.contract.getProposalNonce()).add(1)
  //   );
  //   await tx.wait();
  // }

  // public setSigner(newSigner: Signer) {
  //   this.signer = newSigner;
  //   this.contract = this.contract.connect(newSigner);
  // }
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


  // public async getHandler(): Promise<string> {
  //   return this.contract.handler();
  // }

  // public async getHandlerProposalData(newHandler: string): Promise<string> {
  //   const resourceID = await this.createResourceId();
  //   const functionSig = ethers.utils
  //     .keccak256(ethers.utils.toUtf8Bytes('setHandler(address,uint32)'))
  //     .slice(0, 10)
  //     .padEnd(10, '0');
  //   const nonce = Number(await this.contract.getProposalNonce()) + 1;
  //
  //   return (
  //     '0x' +
  //     toHex(resourceID, 32).substr(2) +
  //     functionSig.slice(2) +
  //     toHex(nonce, 4).substr(2) +
  //     toHex(newHandler, 20).substr(2)
  //   );
  // }

  public async populateRootsForProof(groupId: number): Promise<string[]> {
    const neighborEdges = await this.contract.getLatestNeighborEdges(groupId);
    const neighborRootInfos = neighborEdges.map((rootData) => {
      return rootData.root;
    });
    const thisRoot = await this.contract.getRoot(groupId);
    return [thisRoot.toString(), ...neighborRootInfos];
  }

  public async createGroup(groupId: number, depth: number, groupAdminAddr: string, maxEdges: number): Promise<ContractTransaction> {
      if(groupId in this.groups) {
        throw new Error(`Group ${groupId} has already been created`);
      } else {
        this.groups[groupId] = new Group(depth, BigInt(this.zeroValue))
        return this.contract.createGroup(groupId, depth, groupAdminAddr, maxEdges)
      }
  }

  public async getClassAndContractRoots(groupId: number): Promise<BigNumberish[]> {
    return [this.groups[groupId].root, await this.contract.getRoot(groupId)];
  }

  public async addMember(groupId: number, leaf: BigNumberish): Promise<ContractTransaction> {
      if(!(groupId in this.groups)) {
        throw new Error(`Group ${groupId} doesn't exist`);
      } else {
        this.groups[groupId].addMember(leaf)
        return this.contract.addMember(groupId, leaf, { gasLimit: '0x5B8D80' });
      }
  }
}

export default Semaphore;
