import { readFileSync } from "fs"

export type DeployedContracts = {
    Poseidon: string
    Semaphore: string
    Verifier: string
}

export function getDeployedContracts(network: string | undefined): DeployedContracts | null {
    try {
        return JSON.parse(readFileSync(`./deployed-contracts/${network}.json`, "utf8"))
    } catch (error) {
        return null
    }
}
