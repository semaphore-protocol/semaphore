import { generateMerkleProof, genSignalHash, MerkleProof } from "@zk-kit/protocols"
import { ethers } from "ethers"

export const SnarkScalarField = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
export const TreeZeroNode = BigInt(ethers.utils.solidityKeccak256(["string"], ["Semaphore"])) % SnarkScalarField

export function createMerkleProof(leaves: bigint[], leaf: bigint) {
  const merkleProof = generateMerkleProof(20, TreeZeroNode, 2, leaves, leaf)

  merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

  return merkleProof
}

export function genWitness(
  identityTrapdoor: bigint,
  identityNullifier: bigint,
  merkleProof: MerkleProof,
  externalNullifier: bigint,
  signal: string,
  shouldHash = true
): any {
  return {
    identityNullifier: identityNullifier,
    identityTrapdoor: identityTrapdoor,
    treePathIndices: merkleProof.pathIndices,
    treeSiblings: merkleProof.siblings,
    externalNullifier: externalNullifier,
    signalHash: shouldHash ? genSignalHash(signal) : signal
  }
}
