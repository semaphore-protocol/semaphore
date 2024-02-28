import { SemaphoreSubgraph, SemaphoreEthers } from "@semaphore-protocol/data"
import logSymbols from "log-symbols"
import Spinner from "./spinner.js"

/**
 * Gets all group ids on the specified network
 * @param network The specified network
 */
export default async function getGroupIds(network): Promise<string[]> {
    let groupIds: string[]

    const spinner = new Spinner("Fetching groups")

    spinner.start()

    try {
        const semaphoreSubgraph = new SemaphoreSubgraph(network)

        groupIds = await semaphoreSubgraph.getGroupIds()

        spinner.stop()
    } catch {
        try {
            const semaphoreEthers = new SemaphoreEthers(network)

            groupIds = await semaphoreEthers.getGroupIds()

            spinner.stop()
        } catch {
            spinner.stop()

            console.info(`\n ${logSymbols.error}`, "error: unexpected error with the SemaphoreEthers package")

            return null
        }
    }
    return groupIds
}
