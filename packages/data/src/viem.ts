import { Chain, PublicClient, http, createPublicClient, getContract, GetContractReturnType } from "viem"
import { arbitrum, arbitrumGoerli, polygon, goerli, sepolia, optimismGoerli } from "viem/chains"
import SemaphoreABI from "./semaphoreABI"
import { GroupResponse, ViemOptions } from "./types"
import checkParameter from "./checkParameter"

export default class SemaphoreViem {
    private _client: PublicClient
    private _options: ViemOptions
    private _contract: GetContractReturnType<typeof SemaphoreABI, PublicClient>

    /**
     * Initializes the Viem object with an viem chain.
     * @param network Chain object of viem.
     * @param options Viem options.
     */
    constructor(network: Chain = sepolia, options: ViemOptions = {}) {
        if (options.rpcURL) {
            checkParameter(options.rpcURL, "rpcURL", "string")
            // eslint-disable-next-line no-new
            new URL(options.rpcURL) // Check if the URL is valid
        }
        const transport = http(options.rpcURL)
        const client = createPublicClient({ chain: network, transport })

        switch (network.name) {
            case arbitrum.name:
                options.address ??= "0xc60E0Ee1a2770d5F619858C641f14FC4a6401520" as const
                options.startBlock ??= 77278430
                break
            case arbitrumGoerli.name:
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131" as const
                options.startBlock ??= 15174410
                break
            case polygon.name:
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131" as const
                options.startBlock ??= 33995010
                break
            case goerli.name:
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131" as const
                options.startBlock ??= 8777695
                break
            case sepolia.name:
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131" as const
                options.startBlock ??= 3231111
                break
            case optimismGoerli.name:
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131" as const
                options.startBlock ??= 7632846
                break
            default:
                if (options.address === undefined) {
                    throw new Error(`You should provide a Semaphore contract address for this network`)
                }

                options.startBlock ??= 0
        }

        this._client = client
        this._options = options
        this._contract = getContract({ address: options.address, abi: SemaphoreABI, publicClient: client })
    }

    /**
     * Returns the viem public client.
     * @returns viem public client.
     */
    get client(): PublicClient {
        return this._client
    }

    /**
     * Returns the Viem options.
     * @returns Viem options.
     */
    get options(): ViemOptions {
        return this._options
    }

    /**
     * Returns the Semaphore contract.
     * @returns Semaphore contract.
     */
    get contract(): GetContractReturnType<typeof SemaphoreABI, PublicClient> {
        return this._contract
    }

    /**
     * Returns the Semaphore contract address.
     * @returns Semaphore contract address.
     */
    async getGroupIds(): Promise<string[]> {
        const groups = await this._contract.getEvents.GroupCreated(
            {},
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )
        return groups.map((group) => String(group.args.groupId))
    }

    /**
     * Returns the list of group ids.
     * @returns List of group ids.
     */
    async getGroup(groupId: string): Promise<GroupResponse> {
        checkParameter(groupId, "groupId", "string")

        const groupIdBigint = BigInt(groupId)
        const [groupCreatedEvent] = await this._contract.getEvents.GroupCreated(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const merkleTreeRoot = await this._contract.read.getMerkleTreeRoot([groupIdBigint])
        const numberOfLeaves = await this._contract.read.getNumberOfMerkleTreeLeaves([groupIdBigint])

        const group: GroupResponse = {
            id: groupId,
            merkleTree: {
                depth: Number(groupCreatedEvent.args.merkleTreeDepth),
                zeroValue: groupCreatedEvent.args.zeroValue?.toString() as string,
                numberOfLeaves: Number(numberOfLeaves),
                root: merkleTreeRoot?.toString() as string
            }
        }

        return group
    }

    /**
     * Returns a specific group.
     * @param groupId Group id.
     * @returns Specific group.
     */
    async getGroupAdmin(groupId: string): Promise<string> {
        checkParameter(groupId, "groupId", "string")

        const groupAdminUpdatedEvents = await this._contract.getEvents.GroupAdminUpdated(
            { groupId: BigInt(groupId) },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        if (groupAdminUpdatedEvents.length === 0) {
            throw new Error(`Group '${groupId}' not found`)
        }

        return groupAdminUpdatedEvents[groupAdminUpdatedEvents.length - 1].args.newAdmin?.toString() as string
    }

    /**
     * Returns a group admin.
     * @param groupId Group id.
     * @returns Group admin.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        checkParameter(groupId, "groupId", "string")

        const groupIdBigint = BigInt(groupId)
        const [groupCreatedEvent] = await this._contract.getEvents.GroupCreated(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const zeroValue = groupCreatedEvent.args.zeroValue?.toString() as string
        const memberRemovedEvents = await this._contract.getEvents.MemberRemoved(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )
        const memberUpdatedEvents = await this._contract.getEvents.MemberUpdated(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        const groupUpdates = new Map<string, [bigint, string]>()

        for (const { blockNumber, args } of memberUpdatedEvents) {
            groupUpdates.set(args.index?.toString()!, [blockNumber, args.newIdentityCommitment?.toString()!])
        }

        for (const { blockNumber, args } of memberRemovedEvents) {
            const groupUpdate = groupUpdates.get(args.index?.toString()!)

            if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
                groupUpdates.set(args.index?.toString()!, [blockNumber, zeroValue])
            }
        }

        const memberAddedEvents = await this._contract.getEvents.MemberAdded(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )
        const members: string[] = []

        for (const { args } of memberAddedEvents) {
            const { index, identityCommitment } = args
            const groupUpdate = groupUpdates.get(index?.toString()!)
            const member = groupUpdate ? groupUpdate[1].toString() : identityCommitment?.toString()!

            members.push(member)
        }

        return members
    }

    /**
     * Returns a list of group members.
     * @param groupId Group id.
     * @returns Group members.
     */
    async getGroupVerifiedProofs(groupId: string) {
        checkParameter(groupId, "groupId", "string")

        const groupIdBigint = BigInt(groupId)
        const [groupCreatedEvent] = await this._contract.getEvents.GroupCreated(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const proofVerifiedEvents = await this._contract.getEvents.ProofVerified(
            { groupId: groupIdBigint },
            { fromBlock: BigInt(this._options.startBlock!), toBlock: "latest" }
        )

        return proofVerifiedEvents.map((event) => ({
            signal: event.args.signal?.toString() as string,
            merkleTreeRoot: event.args.merkleTreeRoot?.toString() as string,
            externalNullifier: event.args.externalNullifier?.toString() as string,
            nullifierHash: event.args.nullifierHash?.toString() as string
        }))
    }
}
