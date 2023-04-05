import { Network } from "./types"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param network Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(network: Network): string {
    switch (network) {
        case "goerli":
        case "mumbai":
        case "optimism-goerli":
        case "arbitrum-goerli":
        case "arbitrum":
            return `https://api.studio.thegraph.com/query/14377/semaphore-${network}/v3.6.1`
        default:
            throw new TypeError(`Network '${network}' is not supported`)
    }
}
