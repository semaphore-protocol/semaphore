import { Identity } from "@semaphore-protocol/identity"

export function createIdentityCommitments(n: number): bigint[] {
    const identityCommitments: bigint[] = []

    for (let i = 0; i < n; i++) {
        const identity = new Identity(i.toString())
        const identityCommitment = identity.generateCommitment()

        identityCommitments.push(identityCommitment)
    }

    return identityCommitments
}
