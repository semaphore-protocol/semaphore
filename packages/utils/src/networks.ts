// eslint-disable-next-line import/no-relative-packages
import deployedContracts from "../../contracts/deployed-contracts.json"
import { SupportedNetwork } from "./types"

// List of Semaphore supported networks.
const supportedNetworks: SupportedNetwork[] = [
    "sepolia",
    // "matic-mumbai",
    // "optimism-sepolia",
    "arbitrum-sepolia"
    // "arbitrum"
]

// Default Semaphore network.
const defaultNetwork: SupportedNetwork = "sepolia"

export function getDeployedContract(supportedNetwork: SupportedNetwork) {
    const deployedContract = deployedContracts.find(({ network }) => network === supportedNetwork)

    if (!deployedContract) {
        throw new Error(`Semaphore has not been deployed on '${supportedNetwork}' yet`)
    }

    return deployedContract.contracts.find(({ name }) => name === "Semaphore") as {
        name: string
        address: string
        startBlock: number
    }
}

export { defaultNetwork, deployedContracts, supportedNetworks }
