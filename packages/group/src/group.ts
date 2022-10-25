<<<<<<< HEAD
import { BigNumber, BigNumberish } from "ethers"
import { Member } from "./types"
import { MerkleTree, MerkleProof } from "@webb-tools/sdk-core"

export declare type Leaf = {
  index: number
  commitment: BigNumberish
}

export class Group {
  private _merkleTree: MerkleTree
=======
import { IncrementalMerkleTree, MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { poseidon } from "circomlibjs"
import { Member } from "./types"

export default class Group {
    private _merkleTree: IncrementalMerkleTree
>>>>>>> origin/main

  /**
   * Initializes the group with the tree depth and the zero value.
   * @param treeDepth Tree depth.
<<<<<<< HEAD
   */
  constructor(treeDepth = 20) {
=======
     * @param zeroValue Zero values for zeroes.
     */
    constructor(treeDepth = 20, zeroValue: Member = BigInt(0)) {
>>>>>>> origin/main
    if (treeDepth < 16 || treeDepth > 32) {
      throw new Error("The tree depth must be between 16 and 32")
    }

<<<<<<< HEAD
    this._merkleTree = new MerkleTree(treeDepth)
=======
        this._merkleTree = new IncrementalMerkleTree(poseidon, treeDepth, zeroValue, 2)
>>>>>>> origin/main
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
<<<<<<< HEAD
  get root(): BigNumberish {
    return this._merkleTree.root()
=======
    get root(): Member {
        return this._merkleTree.root
>>>>>>> origin/main
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  get depth(): number {
<<<<<<< HEAD
    return this._merkleTree.levels
=======
        return this._merkleTree.depth
>>>>>>> origin/main
  }

  /**
   * Returns the zero value of the tree.
   * @returns Tree zero value.
   */
<<<<<<< HEAD
  get zeroValue(): BigNumber {
    return this._merkleTree.zeros()[0]
  }

  /**
   * Returns the zeros array for merkle tree intial values
   * @returns List of tree zeros value.
   */
  get zeros(): BigNumber[] {
    return this._merkleTree.zeros()
=======
    get zeroValue(): Member {
        return this._merkleTree.zeroes[0]
>>>>>>> origin/main
  }

  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
<<<<<<< HEAD
  get members(): BigNumber[] {
    return this._merkleTree.elements()
=======
    get members(): Member[] {
        return this._merkleTree.leaves
>>>>>>> origin/main
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
<<<<<<< HEAD
    this._merkleTree.insert(identityCommitment)
=======
        this._merkleTree.insert(BigInt(identityCommitment))
>>>>>>> origin/main
  }

  /**
   * Adds new members to the group.
   * @param identityCommitments New members.
   */
<<<<<<< HEAD
  addMembers(identityCommitments: BigNumberish[]) {
    this._merkleTree.bulkInsert(identityCommitments)
=======
    addMembers(identityCommitments: Member[]) {
        for (const identityCommitment of identityCommitments) {
            this.addMember(identityCommitment)
        }
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param identityCommitment New member value.
     */
    updateMember(index: number, identityCommitment: Member) {
        this._merkleTree.update(index, identityCommitment)
>>>>>>> origin/main
  }

  /**
   * Removes a member from the group.
<<<<<<< HEAD
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
=======
     * @param index Index of the member to be removed.
     */
    removeMember(index: number) {
        this._merkleTree.delete(index)
>>>>>>> origin/main
  }

  /**
   * Creates a proof of membership.
   * @param index Index of the proof's member.
   * @returns Proof object.
   */
  generateProofOfMembership(index: number): MerkleProof {
<<<<<<< HEAD
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
=======
        const merkleProof = this._merkleTree.createProof(index)

        merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

        return merkleProof
    }
}
>>>>>>> origin/main
