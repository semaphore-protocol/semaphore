import { BigNumber, BigNumberish } from "ethers"
import { Group } from "./group"
import { Member } from "./types"
const assert = require("assert")
// import assert from 'assert';

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods
export class LinkedGroup {
  groupAdmin: string
  group: Group
  levels: number
  maxEdges: number
  roots: Record<number, string>
  // externalGroups: Record<number, Group>
  initialRoot = BigInt(
    "21663839004416932945382355908790599225266501822907911457504978515578255421292"
  )
  chainId: number

  constructor(
    levels: number,
    maxConnectedChains: number,
    groupAdminAddr: string,
    chainId: number,
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
    // this.externalGroups = {}
    this.chainId = chainId
    this.roots[this.chainId] = this.group.root.toString()
  }
  public addMember(leaf: Member): void {
    this.group.addMember(leaf)
    this.roots[this.chainId] = this.group.root.toString()
  }

  public updateEdge(chainId: number, root: string): void {
    assert(
      chainId != this.chainId,
      `chainId: ${this.chainId} corresponds to local chain and thus is not an edge.`
    )

    this.roots[chainId] = BigNumber.from(root).toString()
  }

  public updateGroupAdmin(groupAdminAddr: string): void {
    this.groupAdmin = groupAdminAddr
  }

  public root(): BigNumberish {
    return this.group.root
  }

  public populateRootsForProof(): string[] {
    const neighborEdges = Object.values(this.roots)
    console.log(neighborEdges)
    const thisRoot = this.roots[this.chainId]
    return [thisRoot, ...neighborEdges]
  }
}

export default LinkedGroup
