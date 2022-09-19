import { readFileSync, writeFileSync } from "fs"

export function saveDeployedContracts(network: string | undefined, deployedContracts: any) {
    if (network !== "goerli" && network !== "arbitrum") {
        return
    }

    writeFileSync(`./deployed-contracts/${network}.json`, JSON.stringify(deployedContracts, null, 4))
}

export function getDeployedContracts(network: string | undefined): any {
    if (network !== "goerli" && network !== "arbitrum") {
        return null
    }

    return JSON.parse(readFileSync(`./deployed-contracts/${network}.json`, "utf8"))
}

export function verifiersToSolidityArgument(deployedContracts: any): any {
    const verifiers = []

    if (deployedContracts && deployedContracts.verifiers) {
        for (const verifier in deployedContracts.verifiers) {
            if (Object.prototype.hasOwnProperty.call(deployedContracts.verifiers, verifier)) {
                verifiers.push({
                    merkleTreeDepth: verifier.substring(8),
                    contractAddress: deployedContracts.verifiers[verifier]
                })
            }
        }
    }

    return verifiers
}
