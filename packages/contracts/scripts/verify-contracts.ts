import { hardhatArguments, run } from "hardhat"
import { readFileSync } from "fs"

type DeployedContracts = {
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

async function verify(address: string, constructorArguments?: any[]): Promise<void> {
    try {
        await run("verify:verify", {
            address,
            constructorArguments
        })
    } catch (error) {
        console.error(error)
    }
}

async function main() {
    const deployedContracts = getDeployedContracts(hardhatArguments.network)

    if (deployedContracts) {
        await verify(deployedContracts.Verifier)
        await verify(deployedContracts.Poseidon)
        await verify(deployedContracts.Semaphore, [deployedContracts.Verifier])
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
