import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { NumericString, prove } from "@zk-kit/groth16"
import getSnarkArtifacts from "./get-snark-artifacts.node"
import hash from "./hash"
import packProof from "./pack-proof"
import { SemaphoreProof, SnarkArtifacts } from "./types"

/**
 * Generates a Semaphore proof.
 * @param identity The Semaphore identity.
 * @param group The Semaphore group or its Merkle proof.
 * @param scope The external nullifier.
 * @param message The Semaphore signal.
 * @param treeDepth The depth of the tree with which the circuit was compiled.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    identity: Identity,
    group: Group,
    message: BytesLike | Hexable | number | bigint,
    scope: BytesLike | Hexable | number | bigint,
    treeDepth?: number,
    snarkArtifacts?: SnarkArtifacts
): Promise<SemaphoreProof> {
    const leafIndex = group.indexOf(identity.commitment)
    const merkleProof = group.generateMerkleProof(leafIndex)
    const merkleProofLength = merkleProof.siblings.length

    treeDepth ??= merkleProofLength

    // If the Snark artifacts are not defined they will be automatically downloaded.
    /* istanbul ignore next */
    if (!snarkArtifacts) {
        snarkArtifacts = await getSnarkArtifacts(treeDepth)
    }

    // The index must be converted to a list of indices, 1 for each tree level.
    // The missing siblings can be set to 0, as they won't be used in the circuit.
    const treeIndices = []
    const treeSiblings = merkleProof.siblings

    for (let i = 0; i < treeDepth; i += 1) {
        treeIndices.push((merkleProof.index >> i) & 1)

        if (treeSiblings[i] === undefined) {
            treeSiblings[i] = "0"
        }
    }

    const { proof, publicSignals } = await prove(
        {
            privateKey: identity.secretScalar,
            treeDepth: merkleProofLength,
            treeIndices,
            treeSiblings,
            scope: hash(scope),
            message: hash(message)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        treeRoot: publicSignals[0],
        nullifier: publicSignals[1],
        message: BigNumber.from(message).toString() as NumericString,
        scope: BigNumber.from(scope).toString() as NumericString,
        proof: packProof(proof)
    }
}
