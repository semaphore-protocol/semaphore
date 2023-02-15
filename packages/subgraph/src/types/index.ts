export type Network = "goerli" | "arbitrum"

export type GroupOptions = {
    members?: boolean
    verifiedProofs?: boolean
    filters?: {
        admin?: string
        timestamp?: Date
        timestampGte?: Date
        timestampLte?: Date
    }
}

export type GroupResponse = {
    id: string
    merkleTree: {
        root: string
        depth: number
        zeroValue: string
        numberOfLeaves: number
    }
    admin: string
    members?: string[]
    verifiedProofs?: {
        signal: string
        merkleTreeRoot: string
        externalNullifier: string
        nullifierHash: string
        timestamp: string
    }[]
}