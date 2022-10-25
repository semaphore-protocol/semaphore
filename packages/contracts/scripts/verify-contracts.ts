import { hardhatArguments, run } from "hardhat"
import { getDeployedContracts, verifiersToSolidityArgument } from "./utils"

async function main() {
    const deployedContracts = getDeployedContracts(hardhatArguments.network)

    if (deployedContracts) {
        await run("verify:verify", {
            address: deployedContracts.Semaphore,
            constructorArguments: [verifiersToSolidityArgument(deployedContracts)]
        })

        await run("verify:verify", {
            address: deployedContracts.IncrementalBinaryTree
        })
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
