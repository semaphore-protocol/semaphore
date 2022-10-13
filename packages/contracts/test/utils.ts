import { Identity } from "@semaphore-protocol/identity"

// eslint-disable-next-line import/prefer-default-export
export function createIdentityCommitments(n: number): bigint[] {
    const identityCommitments: bigint[] = []

    for (let i = 0; i < n; i += 1) {
        const { commitment } = new Identity(i.toString())

        identityCommitments.push(commitment)
    }

    return identityCommitments
}
