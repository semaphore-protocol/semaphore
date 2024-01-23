/* istanbul ignore file */
import { Contract, EventLog } from "ethers"

/**
 * Returns the list of events of a contract with possible filters.
 * @param contract Contract instance.
 * @param eventName Name of the event.
 * @param filterArgs Filter arguments.
 * @param startBlock Block from which to start fetching.
 * @returns List of contract events.
 */
export default async function getEvents(
    contract: Contract,
    eventName: string,
    filterArgs: any[] = [],
    startBlock: number = 0
): Promise<any[]> {
    const filter = contract.filters[eventName](...filterArgs)
    const events = (await contract.queryFilter(filter, startBlock)) as EventLog[]

    return events.map(({ args, blockNumber }) => ({ ...args, blockNumber }))
}
