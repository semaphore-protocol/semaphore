/* istanbul ignore file */
import { Contract, EventLog } from "ethers/contract"

/**
 * Fetches a list of blockchain events from a smart contract based on specified filters and starting block.
 * @param contract An instance of an ethers Contract connected to the blockchain.
 * @param eventName The name of the event to filter.
 * @param filterArgs Optional arguments to further filter the events.
 * @param startBlock The block number from which to start fetching events (defaults to 0).
 * @returns A promise that resolves to an array of event logs, each including event arguments and the block number.
 */
export default async function getEvents(
    contract: Contract,
    eventName: string,
    filterArgs: any[] = [],
    startBlock: number = 0
): Promise<any[][]> {
    const filter = contract.filters[eventName](...filterArgs)
    const events = (await contract.queryFilter(filter, startBlock)) as EventLog[]

    return events.map(({ args, blockNumber }) => [...args, blockNumber])
}
