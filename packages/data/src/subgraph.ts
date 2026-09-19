import { defaultNetwork, SupportedNetwork } from "@semaphore-protocol/utils/networks"
import { AxiosRequestConfig } from "axios"
import { requireString, requireObject, requireBoolean } from "@zk-kit/utils/error-handlers"
import getURL from "./getURL"
import request from "./request"
import { GroupOptions, GroupResponse } from "./types"
import { jsDateToGraphqlDate } from "./utils"

/**
 * The SemaphoreSubgraph class provides an interface to interact with the Semaphore smart contract
 * via subgraph queries. It enables operations such as retrieving lists of group members and validated proofs,
 * as well as checking membership within groups.
 * Each group in Semaphore is represented as a {@link https://zkkit.pse.dev/classes/_zk_kit_lean_imt.LeanIMT.html | LeanIMT}
 * (Lean Incremental Merkle Tree). This class supports interaction through either a
 * {@link SupportedNetwork} or a direct URL to the subgraph. The subgraphs themselves are hosted on
 * {@link https://thegraph.com/ | The Graph} protocol, facilitating efficient and decentralized query processing.
 */
export default class SemaphoreSubgraph {
    private _url: string

    /**
     * Initializes the SemaphoreSubgraph instance with a supported network or a custom subgraph URL.
     * This allows to interact with the Semaphore smart contract through the specified endpoint.
     * @param networkOrSubgraphURL Either a supported network identifier or a direct URL to the subgraph.
     */
    constructor(networkOrSubgraphURL: SupportedNetwork | string = defaultNetwork) {
        requireString(networkOrSubgraphURL, "networkOrSubgraphURL")

        if (typeof networkOrSubgraphURL === "string" && networkOrSubgraphURL.startsWith("http")) {
            this._url = networkOrSubgraphURL
            return
        }

        this._url = getURL(networkOrSubgraphURL as SupportedNetwork)
    }

    /**
     * Retrieves the URL of the subgraph currently being used by the instance.
     * This URL points to the specific subgraph where Semaphore data is stored.
     * @returns The URL of the subgraph.
     */
    get url(): string {
        return this._url
    }

    /**
     * Fetches a list of all group IDs from the subgraph. This method queries the subgraph to retrieve
     * identifiers for all groups managed by the Semaphore smart contract.
     * @returns A promise that resolves to an array of group IDs.
     */
    async getGroupIds(): Promise<string[]> {
        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups {
                        id
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        return groups.map((group: any) => group.id)
    }

    /**
     * Retrieves detailed information about groups from the subgraph based on the provided options.
     * This method can filter groups by various parameters and include additional details like members
     * and validated proofs if specified in the options.
     * @param options Configuration options to filter groups and specify which additional details to fetch.
     * @returns A promise that resolves to an array of group details.
     */
    async getGroups(options: GroupOptions = {}): Promise<GroupResponse[]> {
        requireObject(options, "options")

        const { members = false, validatedProofs = false } = options

        requireBoolean(members, "members")
        requireBoolean(validatedProofs, "validatedProofs")

        let filtersQuery = ""

        if (options.filters) {
            const { admin, identityCommitment, timestamp, timestampGte, timestampLte } = options.filters
            const filterFragments = []

            if (admin) {
                filterFragments.push(`admin: "${admin}"`)
            }

            if (identityCommitment) {
                filterFragments.push(`members_: { identityCommitment: "${identityCommitment}" }`)
            }

            /* istanbul ignore next */
            if (timestamp) {
                filterFragments.push(`timestamp: "${jsDateToGraphqlDate(timestamp)}"`)
            } else if (timestampGte) {
                filterFragments.push(`timestamp_gte: "${jsDateToGraphqlDate(timestampGte)}"`)
            } else if (timestampLte) {
                filterFragments.push(`timestamp_lte: "${jsDateToGraphqlDate(timestampLte)}"`)
            }

            if (filterFragments.length > 0) {
                filtersQuery = `(where: {${filterFragments.join(", ")}})`
            }
        }

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups ${filtersQuery} {
                        id
                        merkleTree {
                            root
                            depth
                            size
                        }
                        admin
                        ${
                            members === true
                                ? `members(where: { identityCommitment_not: "0" }, orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            validatedProofs === true
                                ? `validatedProofs(orderBy: timestamp) {
                            message
                            merkleTreeRoot
                            merkleTreeDepth
                            scope
                            nullifier
                            points
                            timestamp
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (groups && members) {
            for (const group of groups) {
                group.members = group.members.map((member: any) => member.identityCommitment)
            }
        }

        return groups
    }

    /**
     * Fetches detailed information about a specific group by its ID. This method can also retrieve
     * members and validated proofs for the group if requested via options.
     * @param groupId The unique identifier of the group.
     * @param options Configuration options to specify which details to fetch about the group.
     * @returns A promise that resolves to the details of the specified group.
     */
    async getGroup(groupId: string, options: Omit<GroupOptions, "filters"> = {}): Promise<GroupResponse> {
        requireString(groupId, "groupId")
        requireObject(options, "options")

        const { members = false, validatedProofs = false } = options

        requireBoolean(members, "members")
        requireBoolean(validatedProofs, "validatedProofs")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups(where: { id: "${groupId}" }) {
                        id
                        merkleTree {
                            root
                            depth
                            size
                        }
                        admin
                        ${
                            members === true
                                ? `members(where: { identityCommitment_not: "0" }, orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            validatedProofs === true
                                ? `validatedProofs(orderBy: timestamp) {
                            message
                            merkleTreeRoot
                            merkleTreeDepth
                            scope
                            nullifier
                            points
                            timestamp
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (groups && members) {
            groups[0].members = groups[0].members.map((member: any) => member.identityCommitment)
        }

        return groups[0]
    }

    /**
     * Retrieves a list of members from a specific group.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to an array of group members' identity commitments.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        const group = await this.getGroup(groupId, { members: true }) // parameters are checked inside getGroup
        return group.members!
    }

    /**
     * Fetches a list of validated proofs for a specific group.
     * @param groupId The unique identifier of the group.
     * @returns A promise that resolves to an array of validated proofs.
     */
    async getGroupValidatedProofs(groupId: string): Promise<any[]> {
        const group = await this.getGroup(groupId, { validatedProofs: true }) // parameters are checked inside getGroup

        return group.validatedProofs!
    }

    /**
     * Determines whether a specific member is part of a group. This method queries the subgraph to check
     * if the provided member's identity commitment exists within the specified group.
     * @param groupId The unique identifier of the group.
     * @param member The identity commitment of the member to check.
     * @returns A promise that resolves to true if the member is part of the group, otherwise false.
     */
    async isGroupMember(groupId: string, member: string): Promise<boolean> {
        requireString(groupId, "groupId")
        requireString(member, "member")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups(where: { id: "${groupId}", members_: { identityCommitment: "${member}" } }) {
                        id
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        return groups.length !== 0
    }
}
