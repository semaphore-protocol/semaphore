import { Contract } from "@ethersproject/contracts"
import {
    AlchemyProvider,
    AnkrProvider,
    CloudflareProvider,
    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    PocketProvider,
    Provider
} from "@ethersproject/providers"
import checkParameter from "./checkParameter"
import getEvents from "./getEvents"
import SemaphoreABI from "./semaphoreABI"
import { EthersOptions, GroupResponse, EthersNetwork } from "./types"

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

        if (networkOrEthereumURL === "matic") {
            networkOrEthereumURL = "maticmum"
        }

        switch (networkOrEthereumURL) {
            case "arbitrum":
                options.address ??= "0xc60E0Ee1a2770d5F619858C641f14FC4a6401520"
                options.startBlock ??= 77278430
                break
            case "arbitrum-goerli":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 15174410
                break
            case "maticmum":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 33995010
                break
            case "goerli":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 8777695
                break
            case "sepolia":
                options.address ??= "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
                options.startBlock ??= 3231111
                break
            case "optimism-goerli":
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
                provider = new InfuraProvider(networkOrEthereumURL, options.apiKey)
                break
            case "alchemy":
                provider = new AlchemyProvider(networkOrEthereumURL, options.apiKey)
                break
            case "cloudflare":
                provider = new CloudflareProvider(networkOrEthereumURL, options.apiKey)
                break
            case "etherscan":
                provider = new EtherscanProvider(networkOrEthereumURL, options.apiKey)
                break
            case "pocket":
                provider = new PocketProvider(networkOrEthereumURL, options.apiKey)
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

        const [groupCreatedEvent] = await getEvents(this._contract, "GroupCreated", [groupId], this._options.startBlock)

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const merkleTreeRoot = await this._contract.getMerkleTreeRoot(groupId)
        const numberOfLeaves = await this._contract.getNumberOfMerkleTreeLeaves(groupId)

        const group: GroupResponse = {
            id: groupId,
            merkleTree: {
                depth: groupCreatedEvent.merkleTreeDepth.toString(),
                zeroValue: groupCreatedEvent.zeroValue.toString(),
                numberOfLeaves: numberOfLeaves.toNumber(),
                root: merkleTreeRoot.toString()
            }
        }

        return group
    }

    /**
     * Returns a group admin.
     * @param groupId Group id.
     * @returns Group admin.
     */
    async getGroupAdmin(groupId: string): Promise<string> {
        checkParameter(groupId, "groupId", "string")

        const groupAdminUpdatedEvents = await getEvents(
            this._contract,
            "GroupAdminUpdated",
            [groupId],
            this._options.startBlock
        )

        if (groupAdminUpdatedEvents.length === 0) {
            throw new Error(`Group '${groupId}' not found`)
        }

        return groupAdminUpdatedEvents[groupAdminUpdatedEvents.length - 1].newAdmin.toString()
    }

    /**
     * Returns a list of group members.
     * @param groupId Group id.
     * @returns Group members.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        checkParameter(groupId, "groupId", "string")

        const [groupCreatedEvent] = await getEvents(this._contract, "GroupCreated", [groupId], this._options.startBlock)

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const zeroValue = groupCreatedEvent.zeroValue.toString()
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
        const groupUpdates = new Map<string, [number, string]>()

        for (const { blockNumber, index, newIdentityCommitment } of memberUpdatedEvents) {
            groupUpdates.set(index.toString(), [blockNumber, newIdentityCommitment.toString()])
        }

        for (const { blockNumber, index } of memberRemovedEvents) {
            const groupUpdate = groupUpdates.get(index.toString())

            if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
                groupUpdates.set(index.toString(), [blockNumber, zeroValue])
            }
        }

        const memberAddedEvents = await getEvents(this._contract, "MemberAdded", [groupId], this._options.startBlock)
        const members: string[] = []

        for (const { index, identityCommitment } of memberAddedEvents) {
            const groupUpdate = groupUpdates.get(index.toString())
            const member = groupUpdate ? groupUpdate[1].toString() : identityCommitment.toString()

            members.push(member)
        }

        return members
    }

    /**
     * Returns a list of group verified proofs.
     * @param groupId Group id.
     * @returns Group verified proofs.
     */
    async getGroupVerifiedProofs(groupId: string): Promise<any> {
        checkParameter(groupId, "groupId", "string")

        const [groupCreatedEvent] = await getEvents(this._contract, "GroupCreated", [groupId], this._options.startBlock)

        if (!groupCreatedEvent) {
            throw new Error(`Group '${groupId}' not found`)
        }

        const proofVerifiedEvents = await getEvents(
            this._contract,
            "ProofVerified",
            [groupId],
            this._options.startBlock
        )

        return proofVerifiedEvents.map((event) => ({
            signal: event.signal.toString(),
            merkleTreeRoot: event.merkleTreeRoot.toString(),
            externalNullifier: event.externalNullifier.toString(),
            nullifierHash: event.nullifierHash.toString()
        }))
    }
}
