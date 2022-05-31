import fs from "fs"
import { run, hardhatArguments } from "hardhat"

async function main() {
    const deployedContracts: { name: string; address: string }[] = []

    // Deploy verifiers.
    for (let treeDepth = 16; treeDepth <= 32; treeDepth++) {
        const { address } = await run("deploy:verifier", { depth: treeDepth })

        deployedContracts.push({
            name: `Verifier${treeDepth}`,
            address
        })
    }

    // Deploy Semaphore.
    const { address } = await run("deploy:semaphore", {
        verifiers: deployedContracts.map((c) => ({ merkleTreeDepth: c.name.substring(8), contractAddress: c.address }))
    })

    deployedContracts.push({
        name: `Semaphore`,
        address
    })

    fs.writeFileSync(
        `./deployed-contracts/${hardhatArguments.network}.json`,
        JSON.stringify(deployedContracts, null, 4)
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
