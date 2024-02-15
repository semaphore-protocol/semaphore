import {
    AlchemyProvider,
    AnkrProvider,
    CloudflareProvider,
    Contract,
    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    PocketProvider,
    Provider,
    ZeroAddress
} from "ethers"
import checkParameter from "./checkParameter"
import getEvents from "./getEvents"
import SemaphoreABI from "./semaphoreABI.json"
import { EthersNetwork, EthersOptions, GroupResponse } from "./types"

export default class SemaphoreEthers {
    private _network: EthersNetwork | string
    private _options: EthersOptions
    private _contract: Contract

    /**
     * Initializes the Ethers object with an Ethereum network or custom URL.
     * @param networkOrEthereumURL Ethereum network or custom URL.
     * @param options Ethers options.
     */
    constructor(networkOrEthereumURL: EthersNetwork | string = "sepolia", options: EthersOptions = {}) {
        checkParameter(networkOrEthereumURL, "networkOrSubgraphURL", "string")

        if (options.provider) {
            checkParameter(options.provider, "provider", "string")
        } else if (!networkOrEthereumURL.startsWith("http")) {
            options.provider = "infura"
        }

        if (options.apiKey) {
            checkParameter(options.apiKey, "apiKey", "string")
        }

        if (networkOrEthereumURL === "mumbai") {
            networkOrEthereumURL = "maticmum"
        }

        switch (networkOrEthereumURL) {
            case "arbitrum":
                options.address ??= "0xc60E0Ee1a2770d5F619858C641f14FC4a6401520"
                options.startBlock ??= 77278430
                break
            case "arbitrum-sepolia":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 15174410
                break
            case "maticmum":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 33995010
                break
            case "sepolia":
                options.address ??= "0x5B8e7cC7bAC61A4b952d472b67056B2f260ba6dc"
                options.startBlock ??= 5150903
                break
            case "optimism-sepolia":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 7632846
                break
            default:
                if (options.address === undefined) {
                    throw new Error(`You should provide a Semaphore contract address for this network`)
                }

                options.startBlock ??= 0
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
     * Returns the Ethereum network or custom URL.
     * @returns Ethereum network or custom URL.
     */
    get network(): EthersNetwork | string {
        return this._network
    }

    /**
     * Returns the Ethers options.
     * @returns Ethers options.
     */
    get options(): EthersOptions {
        return this._options
    }

    /**
     * Returns the contract object.
     * @returns Contract object.
     */
    get contract(): Contract {
        return this._contract
    }

    /**
     * Returns the list of group ids.
     * @returns List of group ids.
     */
    async getGroupIds(): Promise<string[]> {
        const groups = await getEvents(this._contract, "GroupCreated", [], this._options.startBlock)

        return groups.map((event: any) => event[0].toString())
    }

    /**
     * Returns a specific group.
     * @param groupId Group id.
     * @returns Specific group.
     */
    async getGroup(groupId: string): Promise<GroupResponse> {
        checkParameter(groupId, "groupId", "string")

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
     * Returns a list of group members.
     * @param groupId Group id.
     * @returns Group members.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        checkParameter(groupId, "groupId", "string")

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
     * Returns a list of group validated proofs.
     * @param groupId Group id.
     * @returns Group validated proofs.
     */
    async getGroupValidatedProofs(groupId: string): Promise<any> {
        checkParameter(groupId, "groupId", "string")

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
     * Returns true if a member is part of group, and false otherwise.
     * @param groupId Group id
     * @param member Group member.
     * @returns True if the member is part of the group, false otherwise.
     */
    async isGroupMember(groupId: string, member: string): Promise<boolean> {
        checkParameter(groupId, "groupId", "string")
        checkParameter(member, "member", "string")

        return this._contract.hasMember(groupId, member)
    }
}
