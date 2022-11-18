import { hardhatArguments, run } from "hardhat"
import { getDeployedContracts } from "./utils"

async function main() {
    const deployedContracts = getDeployedContracts(hardhatArguments.network)

    await run("verify:verify", {
        address: deployedContracts.IncrementalBinaryTree
    })

    await run("verify:verify", {
        address: deployedContracts.Semaphore
    })

    await run("verify:verify", {
        address: deployedContracts.Pairing
    })

    await run("verify:verify", {
        address: deployedContracts.SemaphoreVerifier
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
