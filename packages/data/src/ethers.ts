import {
    SupportedNetwork,
    defaultNetwork,
    getDeployedContract,
    isSupportedNetwork
} from "@semaphore-protocol/utils/networks"
import { ZeroAddress } from "ethers/constants"
import { Contract } from "ethers/contract"
import {
    AlchemyProvider,
    AnkrProvider,
    CloudflareProvider,
    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    PocketProvider,
    Provider
} from "ethers/providers"
import { SemaphoreABI } from "@semaphore-protocol/utils/constants"
import { requireString } from "@zk-kit/utils/error-handlers"
import { EthersNetwork, EthersOptions, GroupResponse } from "./types"
import getEvents from "./getEvents"

/**
 * The SemaphoreEthers class provides a high-level interface to interact with the Semaphore smart contract
 * using the {@link https://docs.ethers.org/v5/ | ethers.js} library. It encapsulates all necessary functionalities to connect to Ethereum networks,
 * manage contract instances, and perform operations such as retrieving group information or checking group memberships.
 * This class simplifies the interaction with the Ethereum blockchain by abstracting the details of network connections
 * and contract interactions.
 */
export default class SemaphoreEthers {
    private _network: EthersNetwork | string
    private _options: EthersOptions
    private _contract: Contract

    /**
     * Constructs a new SemaphoreEthers instance, initializing it with a network or a custom Ethereum node URL,
     * and optional configuration settings for the ethers provider and contract.
     * @param networkOrEthereumURL The Ethereum network name or a custom JSON-RPC URL to connect to.
     * @param options Configuration options for the ethers provider and the Semaphore contract.
     */
    constructor(networkOrEthereumURL: EthersNetwork | string = defaultNetwork, options: EthersOptions = {}) {
        requireString(networkOrEthereumURL, "networkOrEthereumURL")

        if (options.provider) {
            requireString(options.provider, "provider")
        } else if (!networkOrEthereumURL.startsWith("http")) {
            options.provider = "infura"
        }

        if (options.apiKey) {
            requireString(options.apiKey, "apiKey")
        }

        if (isSupportedNetwork(networkOrEthereumURL)) {
            const { address, startBlock } = getDeployedContract(networkOrEthereumURL as SupportedNetwork)

            options.address ??= address
            options.startBlock ??= startBlock
        } else {
            options.startBlock ??= 0
        }

        if (options.address === undefined) {
            throw new Error(`Network '${networkOrEthereumURL}' needs a Semaphore contract address`)
        }

        let provider: Provider

        switch (options.provider) {
            case "infura":
                provider = new InfuraProvider(networkOrEthereumURL, options.projectId, options.projectSecret)
                break
            case "alchemy":
                provider = new AlchemyProvider(networkOrEthereumURL, options.apiKey)
                break
            case "cloudflare":
                provider = new CloudflareProvider(networkOrEthereumURL)
                break
            case "etherscan":
                provider = new EtherscanProvider(networkOrEthereumURL, options.apiKey)
                break
            case "pocket":
                provider = new PocketProvider(networkOrEthereumURL, options.applicationId, options.applicationSecret)
                break
            case "ankr":
                provider = new AnkrProvider(networkOrEthereumURL, options.apiKey)
                break
            default:
                if (!networkOrEthereumURL.startsWith("http")) {
                    throw new Error(`Provider '${options.provider}' is not supported`)
                }

                provider = new JsonRpcProvider(networkOrEthereumURL)
        }

        this._network = networkOrEthereumURL
        this._options = options
        this._contract = new Contract(options.address, SemaphoreABI, provider)
    }

    /**
     * Retrieves the Ethereum network or custom URL currently used by this instance.
     * @returns The network or URL as a string.
     */
    get network(): EthersNetwork | string {
        return this._network
    }

    /**
     * Retrieves the options used for configuring the ethers provider and the Semaphore contract.
     * @returns The configuration options.
     */
    get options(): EthersOptions {
        return this._options
    }

    /**
     * Retrieves the ethers Contract instance used to interact with the Semaphore contract.
     * @returns The Contract instance.
     */
    get contract(): Contract {
        return this._contract
    }

    /**
     * Fetches the list of group IDs from the Semaphore contract by querying the "GroupCreated" events.
     * @returns A promise that resolves to an array of group IDs as strings.
     */
    async getGroupIds(): Promise<string[]> {
        const groups = await getEvents(this._contract, "GroupCreated", [], this._options.startBlock)

        return groups.map((event: any) => event[0].toString())
    }

    /**
     * Retrieves detailed information about a specific group by its ID. This method queries the Semaphore contract
     * to get the group's admin, Merkle tree root, depth, and size.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to a GroupResponse object.
     */
    async getGroup(groupId: string): Promise<GroupResponse> {
        requireString(groupId, "groupId")

        const groupAdmin = await this._contract.getGroupAdmin(groupId)

        if (groupAdmin === ZeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const merkleTreeRoot = await this._contract.getMerkleTreeRoot(groupId)
        const merkleTreeDepth = await this._contract.getMerkleTreeDepth(groupId)
        const merkleTreeSize = await this._contract.getMerkleTreeSize(groupId)

        const group: GroupResponse = {
            id: groupId,
            admin: groupAdmin,
            merkleTree: {
                depth: Number(merkleTreeDepth),
                size: Number(merkleTreeSize),
                root: merkleTreeRoot.toString()
            }
        }

        return group
    }

    /**
     * Fetches a list of members from a specific group. This method queries the Semaphore contract for events
     * related to member additions and updates, and constructs the list of current group members.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to an array of member identity commitments as strings.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        requireString(groupId, "groupId")

        const groupAdmin = await this._contract.getGroupAdmin(groupId)

        if (groupAdmin === ZeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const memberRemovedEvents = await getEvents(
            this._contract,
            "MemberRemoved",
            [groupId],
            this._options.startBlock
        )
        const memberUpdatedEvents = await getEvents(
            this._contract,
            "MemberUpdated",
            [groupId],
            this._options.startBlock
        )
        const memberUpdatedEventsMap = new Map<string, [number, string]>()

        for (const [, index, , newIdentityCommitment, , blockNumber] of memberUpdatedEvents) {
            memberUpdatedEventsMap.set(index.toString(), [blockNumber, newIdentityCommitment.toString()])
        }

        for (const [, index, , , blockNumber] of memberRemovedEvents) {
            const groupUpdate = memberUpdatedEventsMap.get(index.toString())

            if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
                memberUpdatedEventsMap.set(index.toString(), [blockNumber, "0"])
            }
        }

        const membersAddedEvents = await getEvents(this._contract, "MembersAdded", [groupId], this._options.startBlock)

        const membersAddedEventsMap = new Map<string, [string]>()

        for (const [, startIndex, identityCommitments] of membersAddedEvents) {
            membersAddedEventsMap.set(
                startIndex.toString(),
                identityCommitments.map((i: any) => i.toString())
            )
        }

        const memberAddedEvents = await getEvents(this._contract, "MemberAdded", [groupId], this._options.startBlock)

        const members: string[] = []

        const merkleTreeSize = await this._contract.getMerkleTreeSize(groupId)

        let i = 0

        while (i < Number(merkleTreeSize)) {
            const identityCommitments = membersAddedEventsMap.get(i.toString())

            if (identityCommitments) {
                members.push(...identityCommitments)

                i += identityCommitments.length
            } else {
                members.push(memberAddedEvents[i][2])

                i += 1
            }
        }

        for (let j = 0; j < members.length; j += 1) {
            const groupUpdate = memberUpdatedEventsMap.get(j.toString())

            if (groupUpdate) {
                members[j] = groupUpdate[1].toString()
            }
        }

        return members
    }

    /**
     * Retrieves a list of validated proofs for a specific group. This method queries the Semaphore contract
     * for "ProofValidated" events and returns details about each proof.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to an array of validated proofs.
     */
    async getGroupValidatedProofs(groupId: string): Promise<any> {
        requireString(groupId, "groupId")

        const groupAdmin = await this._contract.getGroupAdmin(groupId)

        if (groupAdmin === ZeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const proofValidatedEvents = await getEvents(
            this._contract,
            "ProofValidated",
            [groupId],
            this._options.startBlock
        )

        return proofValidatedEvents.map((event) => ({
            merkleTreeDepth: Number(event[1]),
            merkleTreeRoot: event[2].toString(),
            nullifier: event[3].toString(),
            message: event[4].toString(),
            scope: event[5].toString(),
            points: event[6].map((p: any) => p.toString())
        }))
    }

    /**
     * Checks whether a specific member is part of a group. This method queries the Semaphore contract
     * to determine if the provided identity commitment is a member of the specified group.
     * @param groupId The unique identifier of the group.
     * @param member The identity commitment of the member to check.
     * @returns A promise that resolves to true if the member is part of the group, otherwise false.
     */
    async isGroupMember(groupId: string, member: string): Promise<boolean> {
        requireString(groupId, "groupId")
        requireString(member, "member")

        return this._contract.hasMember(groupId, member)
    }

    /**
     * Listens to the GroupCreated event.
     * @param callback Called with the groupId of the newly created group.
     */
    onGroup(callback: (groupId: string) => void): void {
        this._contract.on("GroupCreated", (groupId: string) => {
            callback(groupId.toString())
        })
    }

    offGroup(): void {
        this._contract.removeAllListeners("GroupCreated")
    }

    /**
     * Listens to member-related events (MemberAdded, MemberRemoved, MemberUpdated).
     * @param callback Called with member data depending on the event type.
     */
    onMember(callback: (eventType: string, identityCommitment: string, oldIdentityCommitment?: string) => void): void {
        this._contract.on("MemberAdded", (_groupId, _index, identityCommitment) => {
            callback("added", identityCommitment.toString())
        })

        this._contract.on("MemberUpdated", (_groupId, _index, oldIdentityCommitment, newIdentityCommitment) => {
            callback("updated", newIdentityCommitment.toString(), oldIdentityCommitment.toString())
        })

        this._contract.on("MemberRemoved", (_groupId, _index, identityCommitment) => {
            callback("removed", identityCommitment.toString())
        })
    }

    offMember(): void {
        this._contract.removeAllListeners("MemberAdded")
        this._contract.removeAllListeners("MemberUpdated")
        this._contract.removeAllListeners("MemberRemoved")
    }
}
