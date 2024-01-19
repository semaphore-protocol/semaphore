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
    validatedProofs?: boolean
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
        numberOfLeaves: number
    }
    admin?: string
    members?: string[]
    validatedProofs?: {
        message: string
        merkleTreeRoot: string
        merkleTreeDepth: number
        scope: string
        nullifier: string
        proof: string[]
        timestamp?: string
    }[]
}

export type EthersOptions = {
    address?: string
    startBlock?: number
    provider?: "etherscan" | "infura" | "alchemy" | "cloudflare" | "pocket" | "ankr"
    apiKey?: string
}
