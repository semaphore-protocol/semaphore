import { readFileSync, writeFileSync } from "fs"

type DeployedContracts = {
    Pairing: string
    SemaphoreVerifier: string
}

export function getVerifierDeployedContracts(network: string | undefined): DeployedContracts | null {
    try {
        return JSON.parse(readFileSync(`./deployed-contracts/verifier/${network}.json`, "utf8"))
    } catch (error) {
        return null
    }
}

export function saveVerifierDeployedContracts(network: string | undefined, deployedContracts: DeployedContracts) {
    writeFileSync(`./deployed-contracts/verifier/${network}.json`, JSON.stringify(deployedContracts, null, 4))
}
