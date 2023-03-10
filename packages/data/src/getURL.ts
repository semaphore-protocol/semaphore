import { Network } from "./types"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param network Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(network: Network): string {
    switch (network) {
        case "goerli":
            return `https://api.studio.thegraph.com/query/14377/semaphore-goerli/v3.2.0`
        case "mumbai":
            return `https://api.studio.thegraph.com/query/14377/semaphore-mumbai/v3.2.0`
        case "arbitrum":
            return `https://api.studio.thegraph.com/query/14377/semaphore-arbitrum/v3.2.0`
        default:
            throw new TypeError(`Network '${network}' is not supported`)
    }
}
