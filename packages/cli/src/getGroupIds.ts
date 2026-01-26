import { SemaphoreSubgraph, SemaphoreEthers } from "@semaphore-protocol/data"
import { SupportedNetwork } from "@semaphore-protocol/utils"
import logSymbols from "log-symbols"
import Spinner from "./spinner.js"

/**
 * Retrieves all group IDs from the Semaphore protocol on a specified network. This function first attempts to
 * fetch the group IDs using the SemaphoreSubgraph interface. If that fails, it tries the SemaphoreEthers interface
 * as a fallback. This dual-method approach ensures higher reliability in fetching data across different network conditions.
 * @param network The blockchain network from which to fetch the group IDs.
 * @returns A promise that resolves to an array of group IDs or null if an error occurs.
 */
export default async function getGroupIds(network: SupportedNetwork): Promise<string[]> {
    let groupIds: string[]
    let shouldLogEthersError = false

    const spinner = new Spinner("Fetching groups")

    spinner.start()

    try {
        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)

            groupIds = await semaphoreSubgraph.getGroupIds()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)

                groupIds = await semaphoreEthers.getGroupIds()
            } catch {
                shouldLogEthersError = true

                return null
            }
        }

        return groupIds
    } finally {
        spinner.stop()

        if (shouldLogEthersError) {
            console.info(`\n ${logSymbols.error}`, "error: unexpected error with the SemaphoreEthers package")
        }
    }
}
