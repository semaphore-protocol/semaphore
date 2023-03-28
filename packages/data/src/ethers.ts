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
import SemaphoreABI from "./semaphoreABI.json"
import { EthersOptions, GroupResponse, Network } from "./types"

export default class SemaphoreEthers {
    private _network: Network | string
    private _options: EthersOptions
    private _contract: Contract

    /**
     * Initializes the Ethers object with an Ethereum network or custom URL.
     * @param networkOrEthereumURL Ethereum network or custom URL.
     * @param options Ethers options.
     */
    constructor(networkOrEthereumURL: Network | string = "sepolia", options: EthersOptions = {}) {
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
                options.address = "0x72dca3c971136bf47BACF16A141f0fcfAC925aeC"
                options.startBlock = 54934350
                break
            case "arbitrum-goerli":
                options.address = "0xbE66454b0Fa9E6b3D53DC1b0f9D21978bb864531"
                options.startBlock = 11902029
                break
            case "maticmum":
                options.address = "0xF864ABa335073e01234c9a88888BfFfa965650bD"
                options.startBlock = 32902215
                break
            case "goerli":
                options.address = "0x89490c95eD199D980Cdb4FF8Bac9977EDb41A7E7"
                options.startBlock = 8255063
                break
            case "sepolia":
                options.address = "0x220fBdB6F996827b1Cf12f0C181E8d5e6de3a36F"
                options.startBlock = 3053948
                break
            case "optimism-goerli":
                options.address = "0x220fBdB6F996827b1Cf12f0C181E8d5e6de3a36F"
                options.startBlock = 6477953
                break
            default:
                if (options.address === undefined) {
                    throw new Error(`You should provide a Semaphore contract address for this network`)
                }

                if (options.startBlock === undefined) {
                    options.startBlock = 0
                }
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
    get network(): Network | string {
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
