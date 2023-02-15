import { AxiosRequestConfig } from "axios"
import checkParameter from "./checkParameter"
import getURL from "./getURL"
import request from "./request"
import { GroupResponse, GroupOptions, Network } from "./types"
import { jsDateToGraphqlDate } from "./utils"

export default class Subgraph {
    private _url: string

    /**
     * Initializes the subgraph object with one of the supported networks.
     * @param network Supported Semaphore network.
     */
    constructor(networkOrSubgraphURL: Network | string = "arbitrum") {
        checkParameter(networkOrSubgraphURL, "networkOrSubgraphURL", "string")

        if (networkOrSubgraphURL.startsWith("http")) {
            this._url = networkOrSubgraphURL
            return
        }

        this._url = getURL(networkOrSubgraphURL as Network)
    }

    /**
     * Returns the subgraph URL.
     * @returns Subgraph URL.
     */
    get url(): string {
        return this._url
    }

    /**
     * Returns the list of groups.
     * @param options Options to select the group parameters.
     * @returns List of groups.
     */
    async getGroups(options: GroupOptions = {}): Promise<GroupResponse[]> {
        checkParameter(options, "options", "object")

        const { members = false, verifiedProofs = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(verifiedProofs, "verifiedProofs", "boolean")

        let filtersQuery = ""
        if (options.filters) {
            const { admin, timestamp, timestampGte, timestampLte } = options.filters
            const filterFragments = []

            if (admin) {
                filterFragments.push(`admin: "${admin}"`)
            }
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
                            zeroValue
                            numberOfLeaves
                        }
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            verifiedProofs === true
                                ? `verifiedProofs(orderBy: timestamp) {
                            signal
                            merkleTreeRoot
                            externalNullifier
                            nullifierHash
                            timestamp
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (members) {
            for (const group of groups) {
                group.members = group.members.map((member: any) => member.identityCommitment)
            }
        }

        return groups
    }

    /**
     * Returns a specific group.
     * @param groupId Group id.
     * @param options Options to select the group parameters.
     * @returns Specific group.
     */
    async getGroup(groupId: string, options: GroupOptions = {}): Promise<GroupResponse> {
        checkParameter(groupId, "groupId", "string")
        checkParameter(options, "options", "object")

        const { members = false, verifiedProofs = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(verifiedProofs, "verifiedProofs", "boolean")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups(where: { id: "${groupId}" }) {
                        id
                        merkleTree {
                            root
                            depth
                            zeroValue
                            numberOfLeaves
                        }
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            verifiedProofs === true
                                ? `verifiedProofs(orderBy: timestamp) {
                            signal
                            merkleTreeRoot
                            externalNullifier
                            nullifierHash
                            timestamp
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (members) {
            groups[0].members = groups[0].members.map((member: any) => member.identityCommitment)
        }

        return groups[0]
    }
}
