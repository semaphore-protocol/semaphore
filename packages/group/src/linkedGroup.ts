import { BigNumber, BigNumberish } from "ethers"
import { Group } from "./group"
import { Member } from "./types"
import { MerkleProof } from "@webb-tools/sdk-core"
import { strict as assert } from "assert"
// import assert from 'assert';

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods

export class LinkedGroup {
  groupAdmin: string | undefined
  group: Group
  levels: number
  maxEdges: number
  // chainId -> merkle-root
  roots: Record<number, BigNumber>
  // externalGroups: Record<number, Group>
  initialRoot = BigNumber.from(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )

  /**
   * Initializes the group with the tree depth and the zero value.
   * @param levels Tree depth.
   * @param maxConnectedChains Maximum number of chains connected to this one (same as maxEdges on smart-contracts)
   * @param groupAdminAddr (optional) address of user (as string)
   * @param group optional parameter to start with a non empty group
   */
  constructor(
    levels: number,
    maxConnectedChains: number,
    // chainId?: number,
    groupAdminAddr?: string,
    group?: Group
  ) {
    this.levels = levels
    this.maxEdges = maxConnectedChains
    this.groupAdmin = groupAdminAddr
    if (typeof group === "undefined") {
      this.group = new Group(levels)
    } else {
      this.group = group
    }

    this.roots = {}

    // chainIds are used to identity roots. Since no other chainId will be 0 there should be no problem
    // in ignoring this group chainId as we can get it from this.group.root
    // This was done to remove chainId from the constructor altogether.
    this.roots[0] = BigNumber.from(this.group.root)
  }

  /**
   * Adds a new member to the group.
   * @param member New member.
   */
  public addMember(member: Member): void {
    this.group.addMember(member)
    this.roots[0] = BigNumber.from(this.group.root)
  }

  /**
   * Adds a list of members to the group.
   * @param members list of new members.
   */
  public addMembers(members: Member[]): void {
    this.group.addMembers(members)
    this.roots[0] = BigNumber.from(this.group.root)
  }

  /**
   * Removes a member from the group.
   * @param member member to be removed.
   */
  public removeMember(member: Member) {
    this.group.removeMember(member)
  }

  /**
   * Removes a list of members from the group.
   * @param members members to be removed.
   */
  public removeMembers(members: Member[]) {
    this.group.removeMembers(members)
  }

  /**
   * Updates this object edge history
   * @param chainId TypedChainID generated with `getChainIdType` from `@webb-tools/utils`
   * @param root new merkle-root
   */
  public updateEdge(chainId: number, root: string): void {
    assert(
      this.root != root,
      `Trying to add this chain's group as an edge to itself.`
    )
    this.roots[chainId] = BigNumber.from(root)
  }

  /**
   * Updates group admin address
   * @param groupAdminAddr address of user (as string)
   */
  public updateGroupAdmin(groupAdminAddr: string): void {
    this.groupAdmin = groupAdminAddr
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  get root(): BigNumberish {
    return this.group.root
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  get depth(): number {
    return this.group.depth
  }

  /**
   * Returns the zero value of the tree.
   * @returns Tree zero value.
   */
  get zeroValue(): BigNumber {
    return this.group.zeroValue
  }

  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
  get members(): BigNumber[] {
    return this.group.members
  }
  /**
   * Returns the zeros array for merkle tree intial values
   * @returns List of tree zeros value.
   */
  get zeros(): BigNumber[] {
    return this.group.zeros
  }
  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
  public getRoots(): BigNumber[] {
    const roots: BigNumber[] = Object.values(this.roots)
    while (roots.length < this.maxEdges + 1) {
      roots.push(this.zeros[this.depth])
    }
    return roots
  }
  /**
   * Returns the index of a member. If the member does not exist it returns -1.
   * @param member Group member.
   * @returns Index of the member.
   */
  public indexOf(member: Member): number {
    return this.group.indexOf(member)
  }

  /**
   * Checks wheter a merkle-root is valid
   * @param root: merkle-root
   * @returns true if root is in the root-set, false otherwise
   */
  public isValidRoot(root: string): boolean {
    return root in Object.values(this.roots)
  }

  /**
   * @param index index to the desired group member
   * @param group Optional group to create proofs to other chain's smart-contract
   * @returns MerkleProof to that index on the tree
   */

  public generateProofOfMembership(index: number, group?: Group): MerkleProof {
    let merkleProof: MerkleProof
    // if no group was supplied. Assume index is in current chain group
    if (typeof group === "undefined") {
      merkleProof = this.group.generateProofOfMembership(index)
    } else {
      // Check if group root is present in edge set.
      // TODO: This could lead to errors if the other chain's group is not up-to-date in this class. Contract would accept as it has a history
      assert(
        this.isValidRoot(group.root.toString()),
        "Group root is not in the edge set."
      )
      merkleProof = group.generateProofOfMembership(index)
    }
    return merkleProof
  }
}

export default LinkedGroup
