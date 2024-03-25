import { SupportedNetwork, isSupportedNetwork } from "@semaphore-protocol/utils"
import { readFileSync, writeFileSync } from "fs"

export type NetworkDeployedContracts = {
    name: "Semaphore" | "SemaphoreVerifier" | "PoseidonT3"
    address: string
    startBlock: number
}[]

export type DeployedContracts = {
    network: string
    contracts: NetworkDeployedContracts
}[]

const deployedContractsPath = "../utils/src/networks/deployed-contracts.json"

export function getDeployedContracts(): DeployedContracts {
    return JSON.parse(readFileSync(deployedContractsPath, "utf8"))
}

export function getDeployedContractsByNetwork(network: string): NetworkDeployedContracts {
    const deployedContracts = getDeployedContracts()
    const networkDeployedContracts = deployedContracts.find((n) => n.network === network)

    if (!networkDeployedContracts) {
        throw Error(`Network '${network}' is not supported`)
    }

    return networkDeployedContracts.contracts
}

export function getDeployedContractAddress(network: string, contractName: string): string {
    const contracts = getDeployedContractsByNetwork(network)
    const semaphoreAddress = contracts.find((contract) => contract.name === contractName)

    if (!semaphoreAddress) {
        throw Error(`Contract with name '${contractName}' does not exist`)
    }

    return semaphoreAddress.address
}

export function saveDeployedContracts(contracts: NetworkDeployedContracts, network?: SupportedNetwork) {
    if (network && isSupportedNetwork(network)) {
        const deployedContracts = getDeployedContracts() as DeployedContracts

        for (let i = 0; i < deployedContracts.length; i += 1) {
            if (deployedContracts[i].network === network) {
                deployedContracts[i].contracts = contracts

                writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 4))

                return
            }
        }

        deployedContracts.push({
            network,
            contracts
        })

        writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 4))
    }
}
