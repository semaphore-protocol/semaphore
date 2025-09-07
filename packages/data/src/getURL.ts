import type { SupportedNetwork } from "@semaphore-protocol/utils"
import { isSupportedNetwork } from "@semaphore-protocol/utils/networks"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * This function retrieves the URL of the Semaphore subgraph based on the provided network.
 * @param supportedNetwork Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(supportedNetwork: SupportedNetwork): string {
    if (!isSupportedNetwork(supportedNetwork)) {
        throw new TypeError(`Network '${supportedNetwork}' is not supported`)
    }

    return `https://api.studio.thegraph.com/query/14377/semaphore-${supportedNetwork}/v4.5.0`
}
