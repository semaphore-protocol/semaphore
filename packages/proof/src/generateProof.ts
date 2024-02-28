import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable, hexZeroPad } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import type { NumericString } from "snarkjs"
import { Fr } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js"
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg"
import { SemaphoreProof } from "./types"
import hash from "./hash"
import compiled from "../noir-artifacts/16.json"

function serialiseInput(value: bigint): string {
    return new Fr(value).toString()
}

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
    externalNullifier: Fr,
    signal: BytesLike | Hexable | number | bigint
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

    // @ts-ignore
    const backend = new BarretenbergBackend(compiled)
    // @ts-ignore
    const noir = new Noir(compiled, backend)

    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(""), 2))
    console.log(merkleProof.siblings)
    const input = {
        id_nullifier: nullifier.toString(),
        id_trapdoor: trapdoor.toString(),
        indices: serialiseInput(indices),
        siblings: merkleProof.siblings.map((sibling) => `0x${BigInt(sibling).toString(16)}`),
        external_nullifier: hexZeroPad(externalNullifier.toString(), 32),
        nullifier_hash: (await hash(externalNullifier, nullifier)).toString(),
        root: merkleProof.root.toString(),
        signal_hash: serialiseInput(BigNumber.from(signal).toBigInt())
    }
    console.log(input)

    // @ts-ignore
    const proof = await noir.generateProof(input)

    return {
        merkleTreeRoot: merkleProof.root,
        nullifierHash: input.nullifier_hash.toString() as NumericString,
        signal: BigNumber.from(signal).toString() as NumericString,
        externalNullifier: BigNumber.from(externalNullifier).toString() as NumericString,
        proof
    }
}
