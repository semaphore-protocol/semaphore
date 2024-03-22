import deployedContracts from "./deployed-contracts.json"

// List of Semaphore supported networks.
export const supportedNetworks = {
    sepolia: {
        name: "Sepolia",
        url: "https://rpc2.sepolia.org",
        chainId: 11155111,
        explorer: "https://sepolia.etherscan.io"
    },
    "arbitrum-sepolia": {
        name: "Arbitrum Sepolia",
        url: "https://sepolia-rollup.arbitrum.io/rpc",
        chainId: 421614,
        explorer: "https://sepolia.arbiscan.io"
    },
    "optimism-sepolia": {
        name: "Optimism Sepolia",
        url: "https://sepolia.optimism.io",
        chainId: 11155420,
        explorer: "https://sepolia-optimism.etherscan.io"
    },
    "matic-mumbai": {
        name: "Matic Mumbai",
        url: "https://rpc-mumbai.polygon.technology",
        chainId: 80001,
        explorer: "https://mumbai.polygonscan.com"
    }
    // "arbitrum"
}

export type SupportedNetwork = keyof typeof supportedNetworks

// Default Semaphore network.
export const defaultNetwork: SupportedNetwork = "sepolia"

export function isSupportedNetwork(supportedNetwork: string): boolean {
    return Object.keys(supportedNetworks).includes(supportedNetwork)
}

export function getHardhatNetworks(account?: string) {
    if (!account) {
        return {}
    }

    const supportedNetworks2 = JSON.parse(JSON.stringify(supportedNetworks))

    for (const key in supportedNetworks2) {
        if (Object.prototype.hasOwnProperty.call(supportedNetworks2, key)) {
            supportedNetworks2[key].accounts = [`0x${account}`]
        }
    }

    return supportedNetworks2
}

export function getDeployedContract(supportedNetwork: SupportedNetwork) {
    if (!isSupportedNetwork(supportedNetwork)) {
        throw new Error(`Semaphore has not been deployed on '${supportedNetwork}' yet`)
    }

    const deployedContract = deployedContracts.find(({ network }) => network === supportedNetwork)

    return deployedContract!.contracts.find(({ name }) => name === "Semaphore") as {
        name: string
        address: string
        startBlock: number
    }
}

export { deployedContracts }
