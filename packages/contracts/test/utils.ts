import { Identity } from "@semaphore-protocol/identity"

// eslint-disable-next-line import/prefer-default-export
export function createIdentityCommitments(n: number): bigint[] {
    const identityCommitments: bigint[] = []

    for (let i = 0; i < n; i += 1) {
        const identity = new Identity(i.toString())
        const identityCommitment = identity.generateCommitment()

        identityCommitments.push(identityCommitment)
    }

    return identityCommitments
}
