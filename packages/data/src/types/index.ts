import { Chain, PublicClient, Transport } from "viem"

export type EthersNetwork =
    | "mainnet"
    | "sepolia"
    | "matic"
    | "matic-amoy"
    | "arbitrum"
    | "arbitrum-sepolia"
    | "optimism"
    | "optimism-sepolia"
    | "base"
    | "base-sepolia"
    | "linea"
    | "linea-sepolia"

export type ViemNetwork = EthersNetwork

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
        size: number
    }
    admin?: string
    members?: string[]
    validatedProofs?: {
        message: string
        merkleTreeRoot: string
        merkleTreeDepth: number
        scope: string
        nullifier: string
        points: string[]
        timestamp?: string
    }[]
}

export type EthersOptions = {
    address?: string
    startBlock?: number
    provider?: "etherscan" | "infura" | "alchemy" | "cloudflare" | "pocket" | "ankr"
    apiKey?: string
    projectId?: string // Infura
    projectSecret?: string // Infura
    applicationId?: string // Pocket
    applicationSecret?: string // Pocket
}

export type ViemOptions = {
    address?: string
    startBlock?: bigint | number
    transport?: Transport // Transport from viem
    chain?: Chain // Chain from viem
    apiKey?: string
    publicClient?: PublicClient
}
