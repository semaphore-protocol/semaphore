import { BigNumber, BigNumberish } from "ethers"
import { MerkleTree, MerkleProof } from "@webb-tools/sdk-core"
import { Member } from "./types"

export declare type Leaf = {
  index: number
  commitment: BigNumberish
}
const DEFAULT_ZERO: BigNumberish =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292"

export class Group {
  private _merkleTree: MerkleTree

  /**
   * Initializes the group with the tree depth and the zero value.
   * @param treeDepth Tree depth.
   */
  constructor(treeDepth = 20, zeroValue: BigNumberish = DEFAULT_ZERO) {
    if (treeDepth < 16 || treeDepth > 32) {
      throw new Error("The tree depth must be between 16 and 32")
    }

    this._merkleTree = new MerkleTree(treeDepth, [], {
      zeroElement: zeroValue
    })
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  get root(): BigNumber {
    return BigNumber.from(this._merkleTree.root())
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
   * Returns the zeros array for merkle tree intial values
   * @returns List of tree zeros value.
   */
  get zeros(): BigNumber[] {
    return this._merkleTree.zeros()
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
   * Updates a member in the group.
   * @param index Index of the member to be updated.
   * @param identityCommitment New member value.
   */
  updateMember(index: number, identityCommitment: Member) {
    this._merkleTree.update(index, identityCommitment)
  }

  /**
   * Removes a member from the group.
   * @param member member to be removed.
   */
  removeMember(member: BigNumberish) {
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
}

export default Group
