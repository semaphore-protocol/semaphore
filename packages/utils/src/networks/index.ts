/**
 * @module Networks
 * This module provides a collection of utility functions to provide the other internal
 * packages and developers with information on deployed contracts and networks supported
 * by Semaphore.
 */

import deployedContracts from "./deployed-contracts.json"
import supportedNetworks from "./supported-networks"

export type SupportedNetwork = keyof typeof supportedNetworks

// Default Semaphore network.
export const defaultNetwork: SupportedNetwork = "sepolia"

/**
 * Returns true if a network is supported by Semaphore, false otherwise.
 * @param supportedNetwork The network to be checked.
 */
export function isSupportedNetwork(supportedNetwork: string): boolean {
    return Object.keys(supportedNetworks).includes(supportedNetwork)
}

/**
 * Utility function to get an object compatible with the Hardhat 'networks' option.
 * If the private key is not defined it returns an empty object.
 * @param privateKey Private key to be used with networks.
 * @returns An object compatible with the Hardhat 'networks' option.
 */
export function getHardhatNetworks(privateKey?: string) {
    if (!privateKey) {
        return {}
    }

    const supportedNetworksCopy = JSON.parse(JSON.stringify(supportedNetworks))

    for (const key in supportedNetworksCopy) {
        if (Object.prototype.hasOwnProperty.call(supportedNetworksCopy, key)) {
            supportedNetworksCopy[key].accounts = [`0x${privateKey}`]
        }
    }

    return supportedNetworksCopy
}

/**
 * Returns name, address and start block of a Semaphore contract deployed
 * on a specific supported network.
 * @param supportedNetwork The network supported by Semaphore.
 * @returns An object with name, address and start block of the deployed contract.
 */
export function getDeployedContract(supportedNetwork: SupportedNetwork) {
    if (!isSupportedNetwork(supportedNetwork)) {
        throw new Error(`Semaphore has not been deployed on '${supportedNetwork}' yet`)
    }

    const networkDeployedContracts = deployedContracts.find(({ network }) => network === supportedNetwork)

    if (!networkDeployedContracts) {
        throw new Error(
            `No deployed contracts found for network '${supportedNetwork}'. ` +
                "Please ensure 'deployed-contracts.json' contains an entry for this network."
        )
    }

    const semaphoreContract = networkDeployedContracts.contracts.find(({ name }) => name === "Semaphore")

    if (!semaphoreContract) {
        throw new Error(
            `Contract 'Semaphore' not found in deployed contracts for network '${supportedNetwork}'. ` +
                "Make sure deployments include 'Semaphore' for this network."
        )
    }

    return semaphoreContract as {
        name: string
        address: string
        startBlock: number
    }
}

export { deployedContracts, supportedNetworks }
