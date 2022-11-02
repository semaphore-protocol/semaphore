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
// import { Identity } from "@webb-tools/semaphore-identity"
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { strict as assert } from "assert"
// import {
//   FullProof,
//   generateProof,
//   packToSolidityProof
// } from "@webb-tools/semaphore-proof"
import { Verifier } from "./verifier"
import {
  Semaphore as SemaphoreContract,
  SemaphoreVoting as SemaphoreVotingContract,
  SemaphoreWhistleblowing as SemaphoreWhistleblowingContract,
  SemaphoreInputEncoder__factory,
  LinkableIncrementalBinaryTree__factory
} from "../build/typechain"

export function createRootsBytes(rootArray: string[] | BigNumberish[]): string {
  let rootsBytes = "0x"
  for (let i = 0; i < rootArray.length; i += 1) {
    rootsBytes += toFixedHex(rootArray[i], 32).substr(2)
  }
  return rootsBytes // root byte string (32 * array.length bytes)
}

export type SemaphoreContractInstance = SemaphoreContract | SemaphoreVotingContract | SemaphoreWhistleblowingContract

export type SemaphoreDeployDependencies = {
  poseidonLibAddr: string;
  linkableTreeAddr: string;
  encodeLibraryAddr: string;
  verifierAddr: string;

}

export class SemaphoreBase {
  signer: Signer
  contract: SemaphoreContractInstance
  chainId: number
  linkedGroups: Record<number, LinkedGroup>
  rootHistory: Record<number, string>
  // hex string of the connected root
  latestSyncedBlock: number
  smallCircuitZkComponents: ZkComponents
  largeCircuitZkComponents: ZkComponents

  zeroValue: bigint = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )

  constructor(
    contract: SemaphoreContractInstance,
    signer: Signer,
    chainId: number,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents
  ) {
    this.signer = signer
    this.contract = contract
    this.chainId = chainId
    this.latestSyncedBlock = 0
    this.smallCircuitZkComponents = smallCircuitZkComponents
    this.largeCircuitZkComponents = largeCircuitZkComponents
    this.linkedGroups = {}
    this.rootHistory = {}
    // this.rootHistory = undefined;
    // this.largeCircuitZkComponents = largeCircuitZkComponents
  }
  public static async deployDependencies(
    signer: Signer
  ): Promise<SemaphoreDeployDependencies> {
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
    return {
      poseidonLibAddr: poseidonLib.address,
      linkableTreeAddr: linkableTree.address,
      encodeLibraryAddr: linkableTree.address,
      verifierAddr: verifier.contract.address
    }
  }

  // public static createRootsBytes(rootArray: string[]) {
  //   let rootsBytes = "0x"
  //   for (let i = 0; i < rootArray.length; i += 1) {
  //     rootsBytes += toFixedHex(rootArray[i]).substr(2)
  //   }
  //   return rootsBytes // root byte string (32 * array.length bytes)
  // }
  public static createRootsBytes(rootArray: string[] | BigNumberish[]): string {
    let rootsBytes = "0x"
    for (let i = 0; i < rootArray.length; i += 1) {
      rootsBytes += toFixedHex(rootArray[i], 32).substr(2)
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
      .map((bignum: BigNumber) => bignum.toString())
  }

  public async getNumberOfMerkleTreeLeaves(pollId: BigNumberish): Promise<BigNumberish> {
    return this.contract.getNumberOfMerkleTreeLeaves(pollId)
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

}
export default SemaphoreBase
