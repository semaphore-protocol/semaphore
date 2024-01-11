import { task, types } from "hardhat/config"

task("deploy:semaphore-verifier", "Deploy a SemaphoreVerifier contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }): Promise<any> => {
        const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier")

        const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

        await semaphoreVerifier.deployed()

        if (logs) {
            console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifier.address}`)
        }

        return {
            semaphoreVerifier
        }
    })
