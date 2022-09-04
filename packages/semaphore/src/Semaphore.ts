import { BigNumber, BigNumberish, ContractTransaction, ethers } from 'ethers';
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
import { hexToU8a, u8aToHex, getChainIdType, ZkComponents } from '@webb-tools/utils';
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
  signer: ethers.Signer;
  contract: SemaphoreContract;
  groups: Record<number, Group>;
  rootHistory: Record<number, string>;
  // hex string of the connected root
  latestSyncedBlock: number;
  // The depositHistory stores leafIndex => information to create proposals (new root)
  smallCircuitZkComponents: ZkComponents;
  largeCircuitZkComponents: ZkComponents;

  constructor(
    contract: SemaphoreContract,
    signer: ethers.Signer,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents
  ) {
    this.signer = signer;
    this.contract = contract;
    this.latestSyncedBlock = 0;
    this.groups = {}
    this.rootHistory = {}
    // this.rootHistory = undefined;
    this.smallCircuitZkComponents = smallCircuitZkComponents
    this.largeCircuitZkComponents = largeCircuitZkComponents
  }
  public static async createSemaphore(
    levels: BigNumberish,
    hasher: string,
    handler: string,
    token: string,
    maxEdges: number,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: ethers.Signer
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
      smallCircuitZkComponents,
      largeCircuitZkComponents
    );
    createdSemaphore.latestSyncedBlock = semaphore.deployTransaction.blockNumber!;
    return createdSemaphore;
  }

  public static async connect(
    // connect via factory method
    // build up tree by querying provider for logs
    address: string,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    signer: ethers.Signer
  ) {
    const semaphore = Semaphore__factory.connect(address, signer);
    const createdSemaphore = new Semaphore(
      semaphore,
      signer,
      smallCircuitZkComponents,
      largeCircuitZkComponents
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

  public async setSigner(newSigner: ethers.Signer) {
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

  public async populateRootsForProof(group_id: number): Promise<string[]> {
    const neighborEdges = await this.contract.getLatestNeighborEdges(group_id);
    const neighborRootInfos = neighborEdges.map((rootData) => {
      return rootData.root;
    });
    const thisRoot = await this.contract.getRoot(group_id);
    return [thisRoot.toString(), ...neighborRootInfos];
  }

  public async createGroup(group_id: number, groupAdmin: string, maxEdges=1, depth=20) {
      if(group_id in this.groups) {
        throw new Error(`Group ${group_id} has already been created`);
      } else {
        this.groups[group_id] = new Group(depth)
        const transaction = this.contract.createGroup(group_id, 20, groupAdmin, maxEdges)
      }
  }

  public async getClassAndContractRoots(group_id: number) {
    return [this.groups[group_id].root, await this.contract.getRoot(group_id)];
  }

  /**
   *
   * @param input A UTXO object that is inside the tree
   * @returns
   */
  // public getMerkleProof(group_id: number, commitment: Commitment): MerkleProof {
  //   let inputMerklePathIndices: number[];
  //   let inputMerklePathElements: BigNumber[];
  //
  //   if (commitment.index < 0) {
  //       throw new Error(`Input commitment ${commitment.value} was not found`);
  //   }
  //   const path = this.groups[group_id].path(commitment.index);
  //   inputMerklePathIndices = path.pathIndices;
  //   inputMerklePathElements = path.pathElements;
  //   const root = this.groups[group_id].root();
  //
  //   return {
  //     element: BigNumber.from(commitment.value),
  //     pathElements: inputMerklePathElements,
  //     pathIndices: inputMerklePathIndices,
  //     merkleRoot: root,
  //   };
  // }

  // public generatePublicInputs(
  //   proof: any,
  //   roots: string[],
  //   inputs: Utxo[],
  //   outputs: Utxo[],
  //   publicAmount: BigNumberish,
  //   extDataHash: string
  // ): IVariableAnchorPublicInputs {
  //   // public inputs to the contract
  //   const args: IVariableAnchorPublicInputs = {
  //     proof: `0x${proof}`,
  //     roots: `0x${roots.map((x) => toFixedHex(x).slice(2)).join('')}`,
  //     inputNullifiers: inputs.map((x) => toFixedHex(x.nullifier)),
  //     outputCommitments: [toFixedHex(u8aToHex(outputs[0].commitment)), toFixedHex(u8aToHex(outputs[1].commitment))],
  //     publicAmount: toFixedHex(publicAmount),
  //     extDataHash: toFixedHex(extDataHash),
  //   };
  //
  //   return args;
  // }

  /**
   * Given a list of leaves and a latest synced block, update internal tree state
   * The function will create a new tree, and check on chain root before updating its member variable
   * If the passed leaves match on chain data,
   *   update this instance and return true
   * else
   *   return false
   */
  // public async setWithLeaves(leaves: string[], syncedBlock?: number): Promise<Boolean> {
  //   let newTree = new MerkleTree(this.tree.levels, leaves);
  //   let root = toFixedHex(newTree.root());
  //   let validTree = await this.contract.isKnownRoot(root);
  //
  //   if (validTree) {
  //     let index = 0;
  //     for (const leaf of newTree.elements()) {
  //       this.rootHistory[index] = toFixedHex(this.groups.root());
  //       index++;
  //     }
  //     if (!syncedBlock) {
  //       syncedBlock = await this.signer.provider.getBlockNumber();
  //     }
  //     this.tree = newTree;
  //     this.latestSyncedBlock = syncedBlock;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // public async setupTransaction(
  //   inputs: Utxo[],
  //   outputs: [Utxo, Utxo],
  //   extAmount: BigNumberish,
  //   fee: BigNumberish,
  //   recipient: string,
  //   relayer: string,
  //   leavesMap: Record<string, Uint8Array[]>
  // ) {
  //   // first, check if the merkle root is known on chain - if not, then update
  //   const chainId = getChainIdType(await this.signer.getChainId());
  //   const roots = await this.populateRootsForProof();
  //
  //   // Start creating notes to satisfy vanchor input
  //   // Only the sourceChainId and secrets (amount, nullifier, secret, blinding)
  //   // is required
  //   let inputNotes: Note[] = [];
  //   let inputIndices: number[] = [];
  //
  //   // calculate the sum of input notes (for calculating the public amount)
  //   let sumInputNotes: BigNumberish = 0;
  //
  //   for (const inputUtxo of inputs) {
  //     sumInputNotes = BigNumber.from(sumInputNotes).add(inputUtxo.amount);
  //
  //     // secrets should be formatted as expected in the wasm-utils for note generation
  //     const secrets =
  //       `${toFixedHex(inputUtxo.chainId, 8).slice(2)}:` +
  //       `${toFixedHex(inputUtxo.amount).slice(2)}:` +
  //       `${toFixedHex(inputUtxo.secret_key).slice(2)}:` +
  //       `${toFixedHex(inputUtxo.blinding).slice(2)}`;
  //
  //     const noteInput: NoteGenInput = {
  //       amount: inputUtxo.amount.toString(),
  //       backend: 'Circom',
  //       curve: 'Bn254',
  //       denomination: '18', // assumed erc20
  //       exponentiation: '5',
  //       hashFunction: 'Poseidon',
  //       index: inputUtxo.index,
  //       protocol: 'vanchor',
  //       secrets,
  //       sourceChain: inputUtxo.originChainId.toString(),
  //       sourceIdentifyingData: '0',
  //       targetChain: chainId.toString(),
  //       targetIdentifyingData: this.contract.address,
  //       tokenSymbol: this.token,
  //       width: '5',
  //     };
  //     const inputNote = await Note.generateNote(noteInput);
  //     inputNotes.push(inputNote);
  //     inputIndices.push(inputUtxo.index);
  //   }
  //
  //   const encryptedCommitments: [Uint8Array, Uint8Array] = [
  //     hexToU8a(outputs[0].encrypt()),
  //     hexToU8a(outputs[1].encrypt()),
  //   ];
  //
  //   const proofInput: ProvingManagerSetupInput<'vanchor'> = {
  //     inputNotes,
  //     leavesMap,
  //     indices: inputIndices,
  //     roots: roots.map((root) => hexToU8a(root)),
  //     chainId: chainId.toString(),
  //     output: outputs,
  //     encryptedCommitments,
  //     publicAmount: BigNumber.from(extAmount).sub(fee).add(FIELD_SIZE).mod(FIELD_SIZE).toString(),
  //     provingKey: inputs.length > 2 ? this.largeCircuitZkComponents.zkey : this.smallCircuitZkComponents.zkey,
  //     relayer: hexToU8a(relayer),
  //     recipient: hexToU8a(recipient),
  //     extAmount: toFixedHex(BigNumber.from(extAmount)),
  //     fee: BigNumber.from(fee).toString(),
  //   };
  //
  //   inputs.length > 2
  //     ? (this.provingManager = new CircomProvingManager(this.largeCircuitZkComponents.wasm, this.tree.levels, null))
  //     : (this.provingManager = new CircomProvingManager(this.smallCircuitZkComponents.wasm, this.tree.levels, null));
  //
  //   const proof = await this.provingManager.prove('vanchor', proofInput);
  //
  //   const publicInputs: IVariableAnchorPublicInputs = this.generatePublicInputs(
  //     proof.proof,
  //     roots,
  //     inputs,
  //     outputs,
  //     proofInput.publicAmount,
  //     u8aToHex(proof.extDataHash)
  //   );
  //
  //   const extData: IVariableAnchorExtData = {
  //     recipient: toFixedHex(proofInput.recipient, 20),
  //     extAmount: toFixedHex(proofInput.extAmount),
  //     relayer: toFixedHex(proofInput.relayer, 20),
  //     fee: toFixedHex(proofInput.fee),
  //     encryptedOutput1: u8aToHex(proofInput.encryptedCommitments[0]),
  //     encryptedOutput2: u8aToHex(proofInput.encryptedCommitments[1]),
  //   };
  //
  //   return {
  //     extData,
  //     publicInputs,
  //   };
  // }

  // public async transact(
  //   inputs: Utxo[],
  //   outputs: Utxo[],
  //   leavesMap: Record<string, Uint8Array[]>,
  //   fee: BigNumberish,
  //   recipient: string,
  //   relayer: string
  // ): Promise<ethers.ContractReceipt> {
  //   // Default UTXO chain ID will match with the configured signer's chain ID
  //   const evmId = await this.signer.getChainId();
  //   const chainId = getChainIdType(evmId);
  //   const randomKeypair = new Keypair();
  //
  //   while (inputs.length !== 2 && inputs.length < 16) {
  //     inputs.push(
  //       await CircomUtxo.generateUtxo({
  //         curve: 'Bn254',
  //         backend: 'Circom',
  //         chainId: chainId.toString(),
  //         originChainId: chainId.toString(),
  //         amount: '0',
  //         blinding: hexToU8a(randomBN(31).toHexString()),
  //         keypair: randomKeypair,
  //       })
  //     );
  //   }
  //
  //   if (outputs.length < 2) {
  //     while (outputs.length < 2) {
  //       outputs.push(
  //         await CircomUtxo.generateUtxo({
  //           curve: 'Bn254',
  //           backend: 'Circom',
  //           chainId: chainId.toString(),
  //           originChainId: chainId.toString(),
  //           amount: '0',
  //           keypair: randomKeypair,
  //         })
  //       );
  //     }
  //   }
  //
  //   let extAmount = BigNumber.from(fee)
  //     .add(outputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)))
  //     .sub(inputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)));
  //
  //   const { extData, publicInputs } = await this.setupTransaction(
  //     inputs,
  //     [outputs[0], outputs[1]],
  //     extAmount,
  //     fee,
  //     recipient,
  //     relayer,
  //     leavesMap
  //   );
  //
  //   let tx = await this.contract.transact(
  //     {
  //       ...publicInputs,
  //       outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
  //     },
  //     extData,
  //     { gasLimit: '0xBB8D80' }
  //   );
  //   const receipt = await tx.wait();
  //   gasBenchmark.push(receipt.gasUsed.toString());
  //
  //   // Add the leaves to the tree
  //   outputs.forEach((x) => {
  //     this.tree.insert(u8aToHex(x.commitment));
  //     let numOfElements = this.tree.number_of_elements();
  //     this.depositHistory[numOfElements - 1] = toFixedHex(this.tree.root().toString());
  //   });
  //
  //   return receipt;
  // }


}

export default Semaphore;
