import { task, types } from "hardhat/config"
import { saveDeployedContracts } from "../scripts/utils"

task("deploy:semaphore", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, semaphoreVerifier: semaphoreVerifierAddress, poseidon: poseidonAddress },
            { ethers, hardhatArguments }
        ): Promise<any> => {
            if (!semaphoreVerifierAddress) {
                const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier")

                const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

                semaphoreVerifierAddress = await semaphoreVerifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
                }
            }

            if (!poseidonAddress) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
                const poseidonT3 = await PoseidonT3Factory.deploy()

                poseidonAddress = await poseidonT3.getAddress()

                if (logs) {
                    console.info(`Poseidon library has been deployed to: ${poseidonAddress}`)
                }
            }

            const SemaphoreFactory = await ethers.getContractFactory("Semaphore", {
                libraries: {
                    PoseidonT3: poseidonAddress
                }
            })

            const semaphore = await SemaphoreFactory.deploy(semaphoreVerifierAddress)

            const semaphoreAddress = await semaphore.getAddress()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)
            }

            saveDeployedContracts(hardhatArguments.network, {
                SemaphoreVerifier: semaphoreVerifierAddress,
                Poseidon: poseidonAddress,
                Semaphore: semaphoreAddress
            })

            return {
                semaphore,
                semaphoreVerifierAddress,
                poseidonAddress
            }
        }
    )
