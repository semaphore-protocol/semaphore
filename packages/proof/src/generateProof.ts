import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { prove } from "@zk-kit/groth16"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import type { NumericString } from "snarkjs"
import hash from "./hash"
import packProof from "./packProof"
import { SemaphoreProof, SnarkArtifacts } from "./types"

/**
 * Generates a Semaphore proof.
 * @param identity The Semaphore identity.
 * @param groupOrMerkleProof The Semaphore group or its Merkle proof.
 * @param externalNullifier The external nullifier.
 * @param signal The Semaphore signal.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    { trapdoor, nullifier, commitment }: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    externalNullifier: BytesLike | Hexable | number | bigint,
    signal: BytesLike | Hexable | number | bigint,
    snarkArtifacts?: SnarkArtifacts
): Promise<SemaphoreProof> {
    let merkleProof: MerkleProof

    if ("depth" in groupOrMerkleProof) {
        const index = groupOrMerkleProof.indexOf(commitment)

        if (index === -1) {
            throw new Error("The identity is not part of the group")
        }

        merkleProof = groupOrMerkleProof.generateMerkleProof(index)
    } else {
        merkleProof = groupOrMerkleProof
    }

    if (!snarkArtifacts) {
        snarkArtifacts = {
            wasmFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.wasm`,
            zkeyFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.zkey`
        }
    }

    const { proof, publicSignals } = await prove(
        {
            identityTrapdoor: trapdoor,
            identityNullifier: nullifier,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            externalNullifier: hash(externalNullifier),
            signalHash: hash(signal)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        merkleTreeRoot: publicSignals[0],
        nullifierHash: publicSignals[1],
        signal: BigNumber.from(signal).toString() as NumericString,
        externalNullifier: BigNumber.from(externalNullifier).toString() as NumericString,
        proof: packProof(proof)
    }
}
