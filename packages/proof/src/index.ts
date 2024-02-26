import { packGroth16Proof, unpackGroth16Proof } from "@zk-kit/utils"
import generateProof from "./generate-proof"
import getSnarkArtifacts from "./get-snark-artifacts.node"
import verifyProof from "./verify-proof"

export * from "./types"
export { generateProof, getSnarkArtifacts, packGroth16Proof, unpackGroth16Proof, verifyProof }
