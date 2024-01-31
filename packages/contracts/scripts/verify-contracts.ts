import { hardhatArguments, run } from "hardhat"
import { getDeployedContractAddress } from "./utils"

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
    if (!hardhatArguments.network) {
        throw Error("Please, define a supported network")
    }

    const semaphoreVerifierAddress = getDeployedContractAddress(hardhatArguments.network, "SemaphoreVerifier")
    const poseidonT3Address = getDeployedContractAddress(hardhatArguments.network, "PoseidonT3")
    const semaphoreAddress = getDeployedContractAddress(hardhatArguments.network, "Semaphore")

    await verify(semaphoreVerifierAddress)
    await verify(poseidonT3Address)
    await verify(semaphoreAddress, [semaphoreVerifierAddress])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
