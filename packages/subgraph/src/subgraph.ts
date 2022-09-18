import { AxiosRequestConfig } from "axios"
import checkParameter from "./checkParameter"
import getURL from "./getURL"
import request from "./request"
import { GroupOptions, Network } from "./types"

export default class Subgraph {
    private _url: string

    /**
     * Initializes the subgraph object with one of the supported networks.
     * @param network Supported Semaphore network.
     */
    constructor(network: Network = "arbitrum") {
        checkParameter(network, "network", "string")

        this._url = getURL(network)
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
    async getGroups(options: GroupOptions = {}): Promise<any[]> {
        checkParameter(options, "options", "object")

        const { members = false, signals = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(signals, "signals", "boolean")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups {
                        id
                        depth
                        zeroValue
                        root
                        numberOfLeaves
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            signals === true
                                ? `verifiedProofs(orderBy: timestamp) {
                            signal
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

        if (signals) {
            for (const group of groups) {
                group.signals = group.verifiedProofs.map((verifiedProof: any) => verifiedProof.signal)

                delete group.verifiedProofs
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
    async getGroup(groupId: string, options: GroupOptions = {}): Promise<any> {
        checkParameter(groupId, "groupId", "string")
        checkParameter(options, "options", "object")

        const { members = false, signals = false } = options

        checkParameter(members, "members", "boolean")
        checkParameter(signals, "signals", "boolean")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups(where: { id: "${groupId}" }) {
                        id
                        depth
                        zeroValue
                        root
                        numberOfLeaves
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                        ${
                            signals === true
                                ? `verifiedProofs(orderBy: timestamp) {
                            signal
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

        if (signals) {
            groups[0].signals = groups[0].verifiedProofs.map((verifiedProof: any) => verifiedProof.signal)

            delete groups[0].verifiedProofs
        }

        return groups[0]
    }
}
