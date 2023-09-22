import { Chain, PublicClient, http, createPublicClient, getContract, GetContractReturnType } from "viem"
import { arbitrum, arbitrumGoerli, polygon, goerli, sepolia, optimismGoerli } from "viem/chains"
import SemaphoreABI from "./semaphoreABI"
import { ViemOptions } from "./types"
import checkParameter from "./checkParameter"

export default class SemaphoreViem {
    private _client: PublicClient
    private _options: ViemOptions
    private _contract: GetContractReturnType<typeof SemaphoreABI>

    constructor(network: Chain, options: ViemOptions) {
        if (options.rpcURL && !options.rpcURL.startsWith("http")) {
            checkParameter(options.rpcURL, "networkOrSubgraphURL", "url string")
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
}
