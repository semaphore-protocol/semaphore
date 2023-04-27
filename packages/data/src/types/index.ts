export enum SupportedNetwork {
    SEPOLIA = "sepolia",
    GOERLI = "goerli",
    MUMBAI = "mumbai",
    OPTIMISM_GOERLI = "optimism-goerli",
    ARBITRUM_GOERLI = "arbitrum-goerli",
    ARBITRUM = "arbitrum"
}

export type EthersNetwork =
    | "homestead"
    | "matic"
    | "goerli"
    | "arbitrum"
    | "maticmum"
    | "mumbai"
    | "arbitrum-goerli"
    | "optimism"
    | "optimism-goerli"
    | "sepolia"

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
