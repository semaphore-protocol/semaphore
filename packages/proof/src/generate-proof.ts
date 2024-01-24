import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { NumericString, groth16 } from "snarkjs"
import getSnarkArtifacts from "./get-snark-artifacts.node"
import hash from "./hash"
import packPoints from "./pack-points"
import { SemaphoreProof, SnarkArtifacts } from "./types"

/**
 * Generates a Semaphore proof.
 * @param identity The Semaphore identity.
 * @param group The Semaphore group or its Merkle proof.
 * @param scope The external nullifier.
 * @param message The Semaphore signal.
 * @param merkleTreeDepth The depth of the tree with which the circuit was compiled.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    identity: Identity,
    group: Group,
    message: BytesLike | Hexable | number | bigint,
    scope: BytesLike | Hexable | number | bigint,
    merkleTreeDepth?: number,
    snarkArtifacts?: SnarkArtifacts
): Promise<SemaphoreProof> {
    const leafIndex = group.indexOf(identity.commitment)
    const merkleProof = group.generateMerkleProof(leafIndex)
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
        message: BigNumber.from(message).toString() as NumericString,
        scope: BigNumber.from(scope).toString() as NumericString,
        points: packPoints(proof)
    }
}
