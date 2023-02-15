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
