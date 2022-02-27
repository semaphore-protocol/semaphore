import { generateMerkleProof } from "@zk-kit/protocols"

export const SnarkScalarField = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")

export function createMerkleProof(leaves: bigint[], leaf: bigint) {
  return generateMerkleProof(20, BigInt(0), leaves, leaf)
}
