import type { SupportedNetwork } from "@semaphore-protocol/utils"
import { supportedNetworks } from "@semaphore-protocol/utils/networks"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param supportedNetwork Semaphore supported network.
 * @returns Subgraph URL.
 */
export default function getURL(supportedNetwork: SupportedNetwork): string {
    if (!supportedNetworks.includes(supportedNetwork)) {
        throw new TypeError(`Network '${supportedNetwork}' is not supported`)
    }

    return `https://api.studio.thegraph.com/query/14377/semaphore-${supportedNetwork}/v4.0.0-alpha.4`
}
