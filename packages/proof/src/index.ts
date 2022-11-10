import generateNullifierHash from "./generateNullifierHash"
// import { generateProof } from "./generateProof"
import { generateProof, createRootsBytes } from "./generateProof"
import verifyProof from "./verifyProof"
import generateSignalHash from "./generateSignalHash"
import packToSolidityProof from "./packToSolidityProof"

export {
  generateNullifierHash,
  generateProof,
  verifyProof,
  generateSignalHash,
  createRootsBytes,
  packToSolidityProof
}
export * from "./types"
