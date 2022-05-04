import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { generateMerkleProof } from "@zk-kit/protocols"
import { poseidon } from "circomlibjs"

export const SnarkScalarField = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")

export function createMerkleProof(leaves: bigint[], leaf: bigint) {
  return generateMerkleProof(20, BigInt(0), leaves, leaf)
}

export function createTree(depth: number, n = 0): IncrementalMerkleTree {
  const tree = new IncrementalMerkleTree(poseidon, depth, BigInt(0), 2)

  for (let i = 0; i < n; i++) {
    tree.insert(BigInt(i + 1))
  }

  return tree
}

export function createIdentityCommitments(n: number): bigint[] {
  const identityCommitments: bigint[] = []

  for (let i = 0; i < n; i++) {
    const identity = new ZkIdentity(Strategy.MESSAGE, i.toString())
    const identityCommitment = identity.genIdentityCommitment()

    identityCommitments.push(identityCommitment)
  }

  return identityCommitments
}
