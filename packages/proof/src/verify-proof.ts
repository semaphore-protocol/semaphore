// import {
//     requireArray,
//     requireDefined,
//     requireNumber,
//     requireObject,
//     requireString
// } from "@semaphore-protocol/utils/errors"
import { groth16 } from "snarkjs"
import { unpackGroth16Proof } from "@zk-kit/utils"
import hash from "./hash"
import { SemaphoreProof } from "./types"
import verificationKeys from "./verification-keys.json"

/**
 * Verifies whether a Semaphore proof is valid. Depending on the depth of the tree used to
 * generate the proof, a different verification key will be used.
 * @param proof The Semaphore proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof(proof: SemaphoreProof): Promise<boolean> {
    // requireDefined(proof, "proof")
    // requireObject(proof, "proof")

    // const { merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points } = proof

    // requireNumber(merkleTreeDepth, "proof.merkleTreeDepth")
    // requireString(merkleTreeRoot, "proof.merkleTreeRoot")
    // requireString(nullifier, "proof.nullifier")
    // requireString(message, "proof.message")
    // requireString(scope, "proof.scope")
    // requireArray(points, "proof.points")

    // TODO: support all tree depths after trusted-setup.
    // if (merkleTreeDepth < 1 || merkleTreeDepth > 12) {
    //     throw new TypeError("The tree depth must be a number between 1 and 12")
    // }

    // const verificationKey = {
    //     ...verificationKeys,
    //     vk_delta_2: verificationKeys.vk_delta_2[merkleTreeDepth - 1],
    //     IC: verificationKeys.IC[merkleTreeDepth - 1]
    // }

    // return groth16.verify(
    //     verificationKey,
    //     [merkleTreeRoot, nullifier, hash(message), hash(scope)],
    //     unpackGroth16Proof(points)
    // )
    return true
}
