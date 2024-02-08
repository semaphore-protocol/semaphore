import type { Group, MerkleProof } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { encodeBytes32String, toBigInt } from "ethers"
import { NumericString, groth16 } from "snarkjs"
import getSnarkArtifacts from "./get-snark-artifacts.node"
import hash from "./hash"
import packPoints from "./pack-points"
import { BigNumberish, SemaphoreProof, SnarkArtifacts } from "./types"

/**
 * Generates a Semaphore proof.
 * @param identity The Semaphore identity.
 * @param groupOrMerkleProof The Semaphore group or its Merkle proof.
 * @param scope The external nullifier.
 * @param message The Semaphore signal.
 * @param merkleTreeDepth The depth of the tree with which the circuit was compiled.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    identity: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    message: BigNumberish | Uint8Array,
    scope: BigNumberish | Uint8Array,
    merkleTreeDepth?: number,
    snarkArtifacts?: SnarkArtifacts
): Promise<SemaphoreProof> {
    try {
        message = toBigInt(message)
    } catch (error: any) {
        if (typeof message === "string") {
            message = encodeBytes32String(message)
        } else {
            throw TypeError(error.message)
        }
    }

    try {
        scope = toBigInt(scope)
    } catch (error: any) {
        if (typeof scope === "string") {
            scope = encodeBytes32String(scope)
        } else {
            throw TypeError(error.message)
        }
    }

    let merkleProof

    if ("siblings" in groupOrMerkleProof) {
        merkleProof = groupOrMerkleProof
    } else {
        const leafIndex = groupOrMerkleProof.indexOf(identity.commitment)
        merkleProof = groupOrMerkleProof.generateMerkleProof(leafIndex)
    }

    const merkleProofLength = merkleProof.siblings.length

    if (merkleTreeDepth !== undefined) {
        if (merkleTreeDepth < 1 || merkleTreeDepth > 12) {
            throw new TypeError("The tree depth must be a number between 1 and 12")
        }
    } else {
        merkleTreeDepth = merkleProofLength
    }

    // If the Snark artifacts are not defined they will be automatically downloaded.
    /* istanbul ignore next */
    if (!snarkArtifacts) {
        snarkArtifacts = await getSnarkArtifacts(merkleTreeDepth)
    }

    // The index must be converted to a list of indices, 1 for each tree level.
    // The missing siblings can be set to 0, as they won't be used in the circuit.
    const merkleProofIndices = []
    const merkleProofSiblings = merkleProof.siblings

    for (let i = 0; i < merkleTreeDepth; i += 1) {
        merkleProofIndices.push((merkleProof.index >> i) & 1)

        if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = "0"
        }
    }

    const { proof, publicSignals } = await groth16.fullProve(
        {
            secret: identity.secretScalar,
            merkleProofLength,
            merkleProofIndices,
            merkleProofSiblings,
            scope: hash(scope),
            message: hash(message)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        merkleTreeDepth,
        merkleTreeRoot: publicSignals[0],
        nullifier: publicSignals[1],
        message: message.toString() as NumericString,
        scope: scope.toString() as NumericString,
        points: packPoints(proof)
    }
}
