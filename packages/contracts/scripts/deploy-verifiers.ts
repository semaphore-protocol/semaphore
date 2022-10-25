import { hardhatArguments, run } from "hardhat"
import { saveDeployedContracts } from "./utils"

async function main() {
    const verifiers: Record<string, string> = {}

    // Deploy verifiers.
    for (let treeDepth = 16; treeDepth <= 32; treeDepth += 1) {
        const { address } = await run("deploy:verifier", { depth: treeDepth })

        verifiers[`Verifier${treeDepth}`] = address
    }

    saveDeployedContracts(hardhatArguments.network, { verifiers })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
