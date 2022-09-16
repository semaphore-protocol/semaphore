import { Network } from "./types"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param network Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(network: Network): string {
    switch (network) {
        case "goerli":
        case "arbitrum":
            return `https://api.thegraph.com/subgraphs/name/semaphore-protocol/${network}`
        default:
            throw new TypeError(`Network '${network}' is not supported`)
    }
}
