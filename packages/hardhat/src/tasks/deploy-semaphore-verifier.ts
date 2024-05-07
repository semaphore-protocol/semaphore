import { task, types } from "hardhat/config"

/**
 * Defines a Hardhat task to deploy the SemaphoreVerifier contract.
 * This task can optionally log the deployment address.
 */
task("deploy:semaphore-verifier", "Deploy a SemaphoreVerifier contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }): Promise<any> => {
        const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier")

        const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

        if (logs) {
            console.info(`SemaphoreVerifier contract has been deployed to: ${await semaphoreVerifier.getAddress()}`)
        }

        return {
            semaphoreVerifier
        }
    })
