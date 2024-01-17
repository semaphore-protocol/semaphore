export enum SupportedNetwork {
    SEPOLIA = "sepolia",
    MUMBAI = "mumbai",
    OPTIMISM_SEPOLIA = "optimism-sepolia",
    ARBITRUM_SEPOLIA = "arbitrum-sepolia",
    ARBITRUM = "arbitrum"
}

export type EthersNetwork =
    | "homestead"
    | "matic"
    | "arbitrum"
    | "maticmum"
    | "mumbai"
    | "arbitrum-sepolia"
    | "optimism"
    | "optimism-sepolia"
    | "sepolia"

export type GroupOptions = {
    members?: boolean
    verifiedProofs?: boolean
    filters?: {
        admin?: string
        identityCommitment?: string
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
    admin?: string
    members?: string[]
    verifiedProofs?: {
        signal: string
        merkleTreeRoot: string
        externalNullifier: string
        nullifierHash: string
        timestamp?: string
    }[]
}

export type EthersOptions = {
    address?: string
    startBlock?: number
    provider?: "etherscan" | "infura" | "alchemy" | "cloudflare" | "pocket" | "ankr"
    apiKey?: string
}
