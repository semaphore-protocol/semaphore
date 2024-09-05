import { task, types } from "hardhat/config"

/**
 * Defines a Hardhat task to deploy the Semaphore contract.
 * This task handles the deployment of dependent contracts like SemaphoreVerifier and PoseidonT3 if not provided.
 */
task("deploy:semaphore", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, semaphoreVerifier: semaphoreVerifierAddress, poseidon: poseidonAddress },
            { ethers }
        ): Promise<any> => {
            // Deploy SemaphoreVerifier if not provided.
            if (!semaphoreVerifierAddress) {
                const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier")

                const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

                semaphoreVerifierAddress = await semaphoreVerifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
                }
            }

            // Deploy PoseidonT3 if not provided.
            if (!poseidonAddress) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
                const poseidonT3 = await PoseidonT3Factory.deploy()

                poseidonAddress = await poseidonT3.getAddress()

                if (logs) {
                    console.info(`Poseidon library has been deployed to: ${poseidonAddress}`)
                }
            }

            // Deploy the Semaphore contract with the necessary library.
            const SemaphoreFactory = await ethers.getContractFactory("Semaphore", {
                libraries: {
                    PoseidonT3: poseidonAddress
                }
            })

            const semaphore = await SemaphoreFactory.deploy(semaphoreVerifierAddress)

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${await semaphore.getAddress()}`)
            }

            return {
                semaphore,
                semaphoreVerifierAddress,
                poseidonAddress
            }
        }
    )
