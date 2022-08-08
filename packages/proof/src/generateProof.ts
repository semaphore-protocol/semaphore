import { Group } from "@semaphore-protocol/group"
// import type { Identity } from "@semaphore-protocol/identity"
import Identity from "../../identity/src/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { groth16 } from "snarkjs"
import generateSignalHash from "./generateSignalHash"
import { BigNumberish, FullProof, SnarkArtifacts } from "./types"

// async function generateProof(
export default async function generateProof(
    identity: Identity,
    group: Group,
    externalNullifier: BigNumberish,
    signal: string,
    snarkArtifacts: SnarkArtifacts
): Promise<FullProof> {
    const commitment = identity.generateCommitment()
    const index = group.indexOf(commitment)

    if (index === -1) {
        throw new Error("The identity is not part of the group")
    }

    const merkleProof = group.generateProofOfMembership(index) // console.log("path INDICES: ", merkleProof.pathIndices)

    const { proof, publicSignals } = await groth16.fullProve(
        {
            identityTrapdoor: identity.getTrapdoor(),
            identityNullifier: identity.getNullifier(),
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            roots: [merkleProof.root, 0],
            chainID: identity.getChainID(),
            externalNullifier,
            signalHash: generateSignalHash(signal)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )
    console.log("public signals: ", publicSignals);

    return {
        proof,
        publicSignals: {
            calculatedRoot: publicSignals[0],
            nullifierHash: publicSignals[1],
            signalHash: publicSignals[2],
            externalNullifier: publicSignals[3],
            // TODO: Fix roots
            roots: [publicSignals[4], publicSignals[5]],

            chainID: publicSignals[6]
        }
    }
}
// export default async function generateProof(
//     identity: Identity,
//     groupOrMerkleProof: Group | MerkleProof,
//     externalNullifier: BigNumberish,
//     signal: string,
//     snarkArtifacts?: SnarkArtifacts
// ): Promise<FullProof> {
//     const commitment = identity.generateCommitment()
//
//     let merkleProof: MerkleProof
//
//     if ("depth" in groupOrMerkleProof) {
//         const index = groupOrMerkleProof.indexOf(commitment)
//
//         if (index === -1) {
//             throw new Error("The identity is not part of the group")
//         }
//
//         merkleProof = groupOrMerkleProof.generateProofOfMembership(index)
//     } else {
//         merkleProof = groupOrMerkleProof
//     }
//
//     if (!snarkArtifacts) {
//         snarkArtifacts = {
//             wasmFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.wasm`,
//             zkeyFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.zkey`
//         }
//     }
//
//     const { proof, publicSignals } = await groth16.fullProve(
//         {
//             identityTrapdoor: identity.getTrapdoor(),
//             identityNullifier: identity.getNullifier(),
//             treePathIndices: merkleProof.pathIndices,
//             treeSiblings: merkleProof.siblings,
//             externalNullifier,
//             signalHash: generateSignalHash(signal)
//         },
//         snarkArtifacts.wasmFilePath,
//         snarkArtifacts.zkeyFilePath
//     )
//
//     return {
//         proof,
//         publicSignals: {
//             merkleRoot: publicSignals[0],
//             nullifierHash: publicSignals[1],
//             signalHash: publicSignals[2],
//             externalNullifier: publicSignals[3]
//         }
//     }
// }
