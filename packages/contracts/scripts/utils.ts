import { readFileSync, writeFileSync } from "fs"

type DeployedContracts = {
    SemaphoreVerifier: string
    Poseidon: string
    Semaphore: string
}

export function getDeployedContracts(network: string | undefined): DeployedContracts | null {
    try {
        return JSON.parse(readFileSync(`./deployed-contracts/${network}.json`, "utf8"))
    } catch (error) {
        return null
    }
}

export function saveDeployedContracts(network: string | undefined, deployedContracts: DeployedContracts) {
    writeFileSync(`./deployed-contracts/${network}.json`, JSON.stringify(deployedContracts, null, 4))
}
