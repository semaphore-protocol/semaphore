import type { SupportedNetwork } from "@semaphore-protocol/utils"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param supportedNetwork Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(supportedNetwork: SupportedNetwork | string): string {
    switch (supportedNetwork) {
        case "sepolia":
        case "mumbai":
        case "optimism-sepolia":
        case "arbitrum-sepolia":
        case "arbitrum":
            return `https://api.studio.thegraph.com/query/14377/semaphore-${supportedNetwork}/v4.0.0-alpha.4`
        default:
            throw new TypeError(`Network '${supportedNetwork}' is not supported`)
    }
}
