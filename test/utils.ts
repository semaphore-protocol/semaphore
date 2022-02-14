import { generateMerkleProof, genSignalHash, MerkleProof } from "@zk-kit/protocols"
import { ethers } from "ethers"

export const SnarkScalarField = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
export const TreeZeroNode = BigInt(ethers.utils.solidityKeccak256(["string"], ["Semaphore"])) % SnarkScalarField

export function createMerkleProof(leaves: bigint[], leaf: bigint) {
  return generateMerkleProof(20, TreeZeroNode, 2, leaves, leaf)
}
