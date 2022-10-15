// import type { Identity } from "@semaphore-protocol/identity"
import { groth16 } from "snarkjs"
import generateSignalHash from "./generateSignalHash"
import { BigNumber, BigNumberish } from "ethers"
import { FullProof, SnarkArtifacts } from "./types"
import { MerkleProof } from "@webb-tools/sdk-core"
import { ZkComponents } from "@webb-tools/utils"

import { Identity } from "@webb-tools/semaphore-identity/src"
import { LinkedGroup } from "@webb-tools/semaphore-group"

export type VerifierContractInfo = {
  name: string
  address: string
  depth: string
  circuitLength: string
}
export function toFixedHex(numb: any, length = 32): string {
  return (
    "0x" +
    (numb instanceof Buffer
      ? numb.toString("hex")
      : BigNumber.from(numb).toHexString().slice(2)
    ).padStart(length * 2, "0")
  )
}

export function createRootsBytes(rootArray: string[] | BigNumberish[]): string {
  let rootsBytes = "0x"
  for (let i = 0; i < rootArray.length; i++) {
    rootsBytes += toFixedHex(rootArray[i], 32).substr(2)
  }
  return rootsBytes // root byte string (32 * array.length bytes)
}
// async function generateProof(
export async function generateProof(
  identity: Identity,
  group: LinkedGroup,
  externalNullifier: BigNumberish,
  signal: string,
  chainID: BigNumberish,
  snarkArtifacts: SnarkArtifacts
): Promise<FullProof> {
  const commitment = identity.generateCommitment()
  const index = group.indexOf(commitment)

  if (index === -1) {
    throw new Error("The identity is not part of the group")
  }

  const merkleProof: MerkleProof = group.generateProofOfMembership(index)
  const pathElements = merkleProof.pathElements.map((bignum) =>
    bignum.toBigInt()
  )

  const { proof, publicSignals } = await groth16.fullProve(
    {
      identityTrapdoor: identity.getTrapdoor(),
      identityNullifier: identity.getNullifier(),
      treePathIndices: merkleProof.pathIndices,
      treeSiblings: pathElements,
      roots: group.getRoots().map((bignum) => bignum.toString()),
      chainID: chainID.toString(),
      externalNullifier: externalNullifier.toString(),
      signalHash: generateSignalHash(signal)
    },
    snarkArtifacts.wasmFilePath,
    snarkArtifacts.zkeyFilePath
  )
  return {
    proof,
    publicSignals: {
      nullifierHash: publicSignals[0],
      signalHash: publicSignals[1],
      externalNullifier: publicSignals[2],
      // TODO: generalize roots for diff maxEdges
      roots: [publicSignals[3], publicSignals[4]],

      chainID: publicSignals[5]
    }
  }
}

export async function shouldWork(
  identity: Identity,
  group: LinkedGroup,
  externalNullifier: BigNumberish,
  signal: string,
  chainId: BigNumberish,
  zkComponents: ZkComponents
): Promise<FullProof> {
  const commitment = identity.generateCommitment()
  const index = group.indexOf(commitment)

  if (index === -1) {
    throw new Error("The identity is not part of the group")
  }

  const merkleProof: MerkleProof = group.generateProofOfMembership(index)
  const pathElements = merkleProof.pathElements.map((bignum) =>
    bignum.toBigInt()
  )

  const { proof, publicSignals } = await groth16.fullProve(
    {
      identityTrapdoor: identity.getTrapdoor(),
      identityNullifier: identity.getNullifier(),
      treePathIndices: merkleProof.pathIndices,
      treeSiblings: pathElements,
      roots: group.getRoots().map((bignum) => bignum.toString()),
      chainID: chainId.toString(),
      externalNullifier: externalNullifier.toString(),
      signalHash: generateSignalHash(signal)
    },
    zkComponents.wasm,
    zkComponents.zkey
  )
  return {
    proof,
    publicSignals
  }
}
