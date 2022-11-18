import { readFileSync, writeFileSync } from "fs"

type DeployedContracts = {
    Pairing?: string
    SemaphoreVerifier?: string
    Poseidon?: string
    IncrementalBinaryTree?: string
    Semaphore?: string
}

export function getDeployedContracts(network: string | undefined): DeployedContracts | null {
    try {
        return JSON.parse(readFileSync(`./deployed-contracts/${network}.json`, "utf8"))
    } catch (error) {
        return {}
    }
}

export function saveDeployedContracts(network: string | undefined, newDeployedContracts: DeployedContracts) {
    const deployedContracts = getDeployedContracts(network)

    writeFileSync(
        `./deployed-contracts/${network}.json`,
        JSON.stringify(
            {
                ...deployedContracts,
                ...newDeployedContracts
            },
            null,
            4
        )
    )
}
