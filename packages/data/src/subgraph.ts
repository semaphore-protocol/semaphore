import { defaultNetwork, SupportedNetwork } from "@semaphore-protocol/utils/networks"
import { AxiosRequestConfig } from "axios"
import checkParameter from "./checkParameter"
import getURL from "./getURL"
import request from "./request"
import { GroupOptions, GroupResponse } from "./types"
import { jsDateToGraphqlDate } from "./utils"

export default class SemaphoreSubgraph {
    private _url: string

    /**
     * Initializes the subgraph object with one of the supported networks or a custom URL.
     * @param networkOrSubgraphURL Supported Semaphore network or custom Subgraph URL.
     */
    constructor(networkOrSubgraphURL: SupportedNetwork | string = defaultNetwork) {
        checkParameter(networkOrSubgraphURL, "networkOrSubgraphURL", "string")

        if (typeof networkOrSubgraphURL === "string" && networkOrSubgraphURL.startsWith("http")) {
            this._url = networkOrSubgraphURL
            return
        }

        this._url = getURL(networkOrSubgraphURL as SupportedNetwork)
    }

    /**
     * Returns the subgraph URL.
     * @returns Subgraph URL.
     */
    get url(): string {
        return this._url
    }

    /**
     * Returns the list of group ids.
     * @returns List of group ids.
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
     * Returns the list of groups.
     * @param options Options to select the group parameters.
     * @returns List of groups.
     */
    async getGroups(options: GroupOptions = {}): Promise<GroupResponse[]> {
        checkParameter(options, "options", "object")

        const { members = false, validatedProofs = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(validatedProofs, "validatedProofs", "boolean")

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
                                ? `members(orderBy: index) {
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
     * Returns a specific group.
     * @param groupId Group id.
     * @param options Options to select the group parameters.
     * @returns Specific group.
     */
    async getGroup(groupId: string, options: Omit<GroupOptions, "filters"> = {}): Promise<GroupResponse> {
        checkParameter(groupId, "groupId", "string")
        checkParameter(options, "options", "object")

        const { members = false, validatedProofs = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(validatedProofs, "validatedProofs", "boolean")

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
                                ? `members(orderBy: index) {
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
     * Returns a list of group members.
     * @param groupId Group id.
     * @returns Group members.
     */
    async getGroupMembers(groupId: string): Promise<string[]> {
        const group = await this.getGroup(groupId, { members: true }) // parameters are checked inside getGroup
        return group.members!
    }

    /**
     * Returns a list of validated proofs.
     * @param groupId Group id.
     * @returns Validated proofs.
     */
    async getGroupValidatedProofs(groupId: string): Promise<any[]> {
        const group = await this.getGroup(groupId, { validatedProofs: true }) // parameters are checked inside getGroup

        return group.validatedProofs!
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
