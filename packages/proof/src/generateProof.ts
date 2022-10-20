// import type { Identity } from "@semaphore-protocol/identity"
import { groth16 } from "snarkjs"
import generateSignalHash from "./generateSignalHash"
import { BigNumber, BigNumberish } from "ethers"
import { FullProof, SnarkArtifacts } from "./types"
import { MerkleProof } from "@webb-tools/sdk-core"
import { ZkComponents } from "@webb-tools/utils"

import { Identity } from "@webb-tools/semaphore-identity/src"
import { LinkedGroup } from "@webb-tools/semaphore-group"
// const assert = require("assert")

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
export type PublicSignals = {
  nullifierHash: string;
  signalHash: string;
  externalNullifier: string;
  roots: string[];
  chainID: string;
}

export function convertPublicSignals(publicSignals: string[]): PublicSignals {
  // assert(publicSignals.length == 6)
  return {
    nullifierHash: publicSignals[0],
    signalHash: publicSignals[1],
    externalNullifier: publicSignals[2],
    roots: [publicSignals[3], publicSignals[4]],
    chainID: publicSignals[5],
  }

}
export type Artifacts = SnarkArtifacts | ZkComponents;
// async function generateProof(
export async function generateProof(
  identity: Identity,
  group: LinkedGroup,
  externalNullifier: BigNumberish,
  signal: string,
  chainID: BigNumberish,
  artifacts: Artifacts,
  // Optional parameter if used on same chain as `group`.
  // Required if using for cross-chain verification
  roots?: string[],
): Promise<FullProof> {
  const commitment = identity.generateCommitment()
  const index = group.indexOf(commitment)

  if (index === -1) {
    throw new Error("The identity is not part of the group")
  }

  const merkleProof: MerkleProof = group.generateProofOfMembership(index)
  const pathElements: bigint[] = merkleProof.pathElements
    .map((bignum: BigNumber) => bignum.toBigInt())

  if(roots == undefined) {
    roots = group.getRoots().map((bignum: BigNumber) => bignum.toString())
  }
  let wasm: Buffer | string
  let zkey: Uint8Array | string
  // console.log("artifacts.type: ", artifacts.kind)
  if('wasmFilePath' in artifacts && 'zkeyFilePath' in artifacts) {
      wasm = artifacts.wasmFilePath
      zkey = artifacts.zkeyFilePath
  } else {
    wasm = artifacts.wasm
    zkey = artifacts.zkey
  }

  let { proof, publicSignals } = await groth16.fullProve(
    {
      identityTrapdoor: identity.getTrapdoor(),
      identityNullifier: identity.getNullifier(),
      treePathIndices: merkleProof.pathIndices,
      treeSiblings: pathElements,
      roots: roots,
      chainID: chainID.toString(),
      externalNullifier: externalNullifier.toString(),
      signalHash: generateSignalHash(signal)
    },
    wasm,
    zkey
  )
  publicSignals = await convertPublicSignals(publicSignals)

  return {
    proof,
    publicSignals
  }
}
