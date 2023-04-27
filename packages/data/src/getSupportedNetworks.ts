import { SupportedNetwork } from "./types"

/**
 * Returns the list of Semaphore supported networks.
 * @returns Semaphore supported networks.
 */
export default function getSupportedNetworks(): string[] {
    return Object.values(SupportedNetwork)
}
