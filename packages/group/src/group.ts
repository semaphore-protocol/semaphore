import { BigNumber, BigNumberish } from "ethers"
import { poseidon } from "circomlibjs"
import { Member } from "./types"
import { MerkleTree, MerkleProof } from "@webb-tools/sdk-core"

// import { u8aToHex } from '@webb-tools/utils';

export declare type Leaf = {
  index: number
  commitment: BigNumberish
}

export class Group {
  private _merkleTree: MerkleTree

  /**
   * Initializes the group with the tree depth and the zero value.
   * @param treeDepth Tree depth.
   */
  constructor(treeDepth = 20) {
    if (treeDepth < 16 || treeDepth > 32) {
      throw new Error("The tree depth must be between 16 and 32")
    }

    this._merkleTree = new MerkleTree(treeDepth)
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  get root(): BigNumberish {
    return this._merkleTree.root()
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  get depth(): number {
    return this._merkleTree.levels
  }

  /**
   * Returns the zero value of the tree.
   * @returns Tree zero value.
   */
  get zeroValue(): BigNumber {
    return this._merkleTree.zeros()[0]
  }

  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
  get members(): BigNumber[] {
    return this._merkleTree.elements()
  }

  /**
   * Returns the index of a member. If the member does not exist it returns -1.
   * @param member Group member.
   * @returns Index of the member.
   */
  indexOf(member: Member): number {
    return this._merkleTree.indexOf(member)
  }

  /**
   * Adds a new member to the group.
   * @param identityCommitment New member.
   */
  addMember(identityCommitment: Member) {
    this._merkleTree.insert(identityCommitment)
  }

  /**
   * Adds new members to the group.
   * @param identityCommitments New members.
   */
  addMembers(identityCommitments: BigNumberish[]) {
    this._merkleTree.bulkInsert(identityCommitments)
  }

  /**
   * Removes a member from the group.
   * @param member member to be removed.
   */
  removeMember(member: Member) {
    this._merkleTree.remove(member)
  }

  /**
   * Removes a list of members from the group.
   * @param members member to be removed.
   */
  removeMembers(members: Member[]) {
    this._merkleTree.bulkRemove(members)
  }

  /**
   * Creates a proof of membership.
   * @param index Index of the proof's member.
   * @returns Proof object.
   */
  generateProofOfMembership(index: number): MerkleProof {
    const merkleProof = this._merkleTree.path(index)
    return merkleProof
  }
  getMerkleProof(index: number): MerkleProof {
    let inputMerklePathIndices: number[]
    let inputMerklePathElements: BigNumber[]
    const commitment = this._merkleTree.elements()[index]

    if (index < 0) {
      throw new Error(`Input commitment for index ${index} was not found`)
    } else {
      const path = this._merkleTree.path(index)
      inputMerklePathIndices = path.pathIndices
      inputMerklePathElements = path.pathElements
      inputMerklePathIndices = new Array(this._merkleTree.levels).fill(0)
      inputMerklePathElements = new Array(this._merkleTree.levels).fill(0)
    }

    return {
      element: BigNumber.from(commitment),
      pathElements: inputMerklePathElements,
      pathIndices: inputMerklePathIndices,
      merkleRoot: this._merkleTree.root()
    }
  }
}

export default Group
