import {
    SupportedNetwork,
    defaultNetwork,
    getDeployedContract,
    isSupportedNetwork
} from "@semaphore-protocol/utils/networks"
import { SemaphoreABI } from "@semaphore-protocol/utils/constants"
import { requireString } from "@zk-kit/utils/error-handlers"
import {
    Address,
    createPublicClient,
    http,
    PublicClient,
    getContract,
    GetContractReturnType,
    zeroAddress,
    Transport,
    Chain,
    Log
} from "viem"
import { GroupResponse, ViemNetwork, ViemOptions } from "./types"

// Define types for the event logs to properly access args
type GroupCreatedLog = Log<bigint, number, boolean, any, any, any, "GroupCreated"> & {
    args: {
        groupId: bigint
    }
}

type MemberRemovedLog = Log<bigint, number, boolean, any, any, any, "MemberRemoved"> & {
    args: {
        groupId: string
        index: bigint
    }
}

type MemberUpdatedLog = Log<bigint, number, boolean, any, any, any, "MemberUpdated"> & {
    args: {
        groupId: string
        index: bigint
        newIdentityCommitment: string
    }
}

type MembersAddedLog = Log<bigint, number, boolean, any, any, any, "MembersAdded"> & {
    args: {
        groupId: string
        startIndex: bigint
        identityCommitments: string[]
    }
}

type MemberAddedLog = Log<bigint, number, boolean, any, any, any, "MemberAdded"> & {
    args: {
        groupId: string
        index: bigint
        identityCommitment: string
    }
}

type ProofValidatedLog = Log<bigint, number, boolean, any, any, any, "ProofValidated"> & {
    args: {
        groupId: string
        message: string
        merkleTreeRoot: string
        merkleTreeDepth: string
        scope: string
        nullifier: string
        x: string
        y: string
    }
}

/**
 * The SemaphoreViem class provides a high-level interface to interact with the Semaphore smart contract
 * using the {@link https://viem.sh | viem} library. It encapsulates all necessary functionalities to connect to Ethereum networks,
 * manage contract instances, and perform operations such as retrieving group information or checking group memberships.
 * This class simplifies the interaction with the Ethereum blockchain by abstracting the details of network connections
 * and contract interactions.
 */
export default class SemaphoreViem {
    private _network: ViemNetwork | string
    private _options: ViemOptions
    private _client: PublicClient
    private _contract: GetContractReturnType<typeof SemaphoreABI, PublicClient>

    /**
     * Constructs a new SemaphoreViem instance, initializing it with a network or a custom Ethereum node URL,
     * and optional configuration settings for the viem client and contract.
     * @param networkOrEthereumURL The Ethereum network name or a custom JSON-RPC URL to connect to.
     * @param options Configuration options for the viem client and the Semaphore contract.
     */
    constructor(networkOrEthereumURL: ViemNetwork | string = defaultNetwork, options: ViemOptions = {}) {
        requireString(networkOrEthereumURL, "networkOrEthereumURL")

        if (options.transport) {
            // Transport is provided directly
        } else if (!networkOrEthereumURL.startsWith("http")) {
            // Default to http transport if no transport is provided and network is not a URL
            options.transport = http()
        }

        if (options.apiKey) {
            requireString(options.apiKey, "apiKey")
        }

        if (isSupportedNetwork(networkOrEthereumURL)) {
            const { address, startBlock } = getDeployedContract(networkOrEthereumURL as SupportedNetwork)

            options.address ??= address
            options.startBlock ??= BigInt(startBlock || 0)
        } else {
            options.startBlock ??= 0n
        }

        if (options.address === undefined) {
            throw new Error(`Network '${networkOrEthereumURL}' needs a Semaphore contract address`)
        }

        // Create the public client
        let transport: Transport

        if (options.transport) {
            transport = options.transport
        } else {
            // If no transport is provided, use http transport with the URL
            transport = http(networkOrEthereumURL)
        }

        this._network = networkOrEthereumURL
        this._options = options

        // Create the public client
        this._client = createPublicClient({
            transport,
            chain: options.chain as Chain
        })

        // Create the contract instance
        this._contract = getContract({
            address: options.address as Address,
            abi: SemaphoreABI,
            client: this._client
        })
    }

    /**
     * Retrieves the Ethereum network or custom URL currently used by this instance.
     * @returns The network or URL as a string.
     */
    get network(): ViemNetwork | string {
        return this._network
    }

    /**
     * Retrieves the options used for configuring the viem client and the Semaphore contract.
     * @returns The configuration options.
     */
    get options(): ViemOptions {
        return this._options
    }

    /**
     * Retrieves the viem Contract instance used to interact with the Semaphore contract.
     * @returns The Contract instance.
     */
    get contract(): GetContractReturnType<typeof SemaphoreABI, PublicClient> {
        return this._contract
    }

    /**
     * Retrieves the viem Public Client instance used to interact with the blockchain.
     * @returns The Public Client instance.
     */
    get client(): PublicClient {
        return this._client
    }

    /**
     * Fetches the list of group IDs from the Semaphore contract by querying the "GroupCreated" events.
     * @returns A promise that resolves to an array of group IDs as strings.
     */
    async getGroupIds(): Promise<string[]> {
        const logs = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "GroupCreated",
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as GroupCreatedLog[]

        return logs.map((log) => log.args.groupId.toString())
    }

    /**
     * Retrieves detailed information about a specific group by its ID. This method queries the Semaphore contract
     * to get the group's admin, Merkle tree root, depth, and size.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to a GroupResponse object.
     */
    async getGroup(groupId: string): Promise<GroupResponse> {
        requireString(groupId, "groupId")

        const groupAdmin = await this._contract.read.getGroupAdmin([groupId])

        if (groupAdmin === zeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const merkleTreeRoot = await this._contract.read.getMerkleTreeRoot([groupId])
        const merkleTreeDepth = await this._contract.read.getMerkleTreeDepth([groupId])
        const merkleTreeSize = await this._contract.read.getMerkleTreeSize([groupId])

        const group: GroupResponse = {
            id: groupId,
            admin: groupAdmin as string,
            merkleTree: {
                depth: Number(merkleTreeDepth),
                size: Number(merkleTreeSize),
                root: merkleTreeRoot ? merkleTreeRoot.toString() : ""
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

        const groupAdmin = await this._contract.read.getGroupAdmin([groupId])

        if (groupAdmin === zeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        // Get member removed events
        const memberRemovedEvents = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "MemberRemoved",
            args: {
                groupId
            },
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as MemberRemovedLog[]

        // Get member updated events
        const memberUpdatedEvents = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "MemberUpdated",
            args: {
                groupId
            },
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as MemberUpdatedLog[]

        const memberUpdatedEventsMap = new Map<string, [bigint, string]>()

        for (const event of memberUpdatedEvents) {
            if (event.args.index && event.args.newIdentityCommitment && event.blockNumber) {
                memberUpdatedEventsMap.set(event.args.index.toString(), [
                    event.blockNumber,
                    event.args.newIdentityCommitment.toString()
                ])
            }
        }

        for (const event of memberRemovedEvents) {
            if (event.args.index && event.blockNumber) {
                const groupUpdate = memberUpdatedEventsMap.get(event.args.index.toString())

                if (!groupUpdate || (groupUpdate && groupUpdate[0] < event.blockNumber)) {
                    memberUpdatedEventsMap.set(event.args.index.toString(), [event.blockNumber, "0"])
                }
            }
        }

        // Get members added events (batch additions)
        const membersAddedEvents = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "MembersAdded",
            args: {
                groupId
            },
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as MembersAddedLog[]

        const membersAddedEventsMap = new Map<string, string[]>()

        for (const event of membersAddedEvents) {
            if (event.args.startIndex && event.args.identityCommitments) {
                membersAddedEventsMap.set(
                    event.args.startIndex.toString(),
                    event.args.identityCommitments.map((i) => i.toString())
                )
            }
        }

        // Get individual member added events
        const memberAddedEvents = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "MemberAdded",
            args: {
                groupId
            },
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as MemberAddedLog[]

        const members: string[] = []

        const merkleTreeSize = await this._contract.read.getMerkleTreeSize([groupId])

        let index = 0

        while (index < Number(merkleTreeSize)) {
            const identityCommitments = membersAddedEventsMap.get(index.toString())

            if (identityCommitments) {
                members.push(...identityCommitments)
                index += identityCommitments.length
            } else {
                const currentIndex = index // Create a closure to capture the current index value
                const event = memberAddedEvents.find((e) => e.args.index && Number(e.args.index) === currentIndex)

                if (event && event.args.identityCommitment) {
                    members.push(event.args.identityCommitment.toString())
                } else {
                    members.push("0") // Placeholder for missing member
                }

                index += 1
            }
        }

        // Apply updates to members
        for (let j = 0; j < members.length; j += 1) {
            const groupUpdate = memberUpdatedEventsMap.get(j.toString())

            if (groupUpdate) {
                members[j] = groupUpdate[1].toString()
            }
        }

        return members
    }

    /**
     * Fetches a list of validated proofs for a specific group. This method queries the Semaphore contract for events
     * related to proof verification.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to an array of validated proofs.
     */
    async getGroupValidatedProofs(groupId: string): Promise<any> {
        requireString(groupId, "groupId")

        const groupAdmin = await this._contract.read.getGroupAdmin([groupId])

        if (groupAdmin === zeroAddress) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const proofValidatedEvents = (await this._client.getContractEvents({
            address: this._options.address as Address,
            abi: SemaphoreABI,
            eventName: "ProofValidated",
            args: {
                groupId
            },
            fromBlock: BigInt(this._options.startBlock || 0)
        })) as ProofValidatedLog[]

        return proofValidatedEvents.map((event) => ({
            message: event.args.message?.toString() || "",
            merkleTreeRoot: event.args.merkleTreeRoot?.toString() || "",
            merkleTreeDepth: event.args.merkleTreeDepth?.toString() || "",
            scope: event.args.scope?.toString() || "",
            nullifier: event.args.nullifier?.toString() || "",
            points: [event.args.x?.toString() || "", event.args.y?.toString() || ""],
            timestamp: event.blockNumber ? new Date(Number(event.blockNumber) * 1000).toISOString() : undefined
        }))
    }

    /**
     * Checks if a given identity commitment is a member of a specific group.
     * @param groupId The unique identifier of the group.
     * @param member The identity commitment to check.
     * @returns A promise that resolves to a boolean indicating whether the member is in the group.
     */
    async isGroupMember(groupId: string, member: string): Promise<boolean> {
        requireString(groupId, "groupId")
        requireString(member, "member")

        const members = await this.getGroupMembers(groupId)

        return members.includes(member)
    }
}
