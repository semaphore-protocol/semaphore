import { SupportedNetwork } from "@semaphore-protocol/utils"
import { task, types } from "hardhat/config"
import { saveDeployedContracts } from "../scripts/utils"

task("deploy", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("verifier", "Verifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, verifier: semaphoreVerifierAddress, poseidon: poseidonT3Address },
            { ethers, hardhatArguments }
        ): Promise<any> => {
            const startBlock = await ethers.provider.getBlockNumber()

            if (!semaphoreVerifierAddress) {
                const VerifierFactory = await ethers.getContractFactory(`SemaphoreVerifier`)

                const verifier = await VerifierFactory.deploy()

                await verifier.waitForDeployment()

                semaphoreVerifierAddress = await verifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
                }
            }

            if (!poseidonT3Address) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")

                const poseidonT3 = await PoseidonT3Factory.deploy()

                await poseidonT3.waitForDeployment()

                poseidonT3Address = await poseidonT3.getAddress()

                if (logs) {
                    console.info(`PoseidonT3 library has been deployed to: ${poseidonT3Address}`)
                }
            }

            const SemaphoreFactory = await ethers.getContractFactory("Semaphore", {
                libraries: {
                    PoseidonT3: poseidonT3Address
                }
            })

            const semaphore = await SemaphoreFactory.deploy(semaphoreVerifierAddress)

            await semaphore.waitForDeployment()

            const semaphoreAddress = await semaphore.getAddress()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)
            }

            saveDeployedContracts(
                [
                    {
                        name: "SemaphoreVerifier",
                        address: semaphoreVerifierAddress,
                        startBlock
                    },
                    {
                        name: "PoseidonT3",
                        address: poseidonT3Address,
                        startBlock
                    },
                    {
                        name: "Semaphore",
                        address: semaphoreAddress,
                        startBlock
                    }
                ],
                hardhatArguments.network as SupportedNetwork
            )

            return {
                semaphore,
                verifierAddress: semaphoreVerifierAddress,
                poseidonAddress: poseidonT3Address
            }
        }
    )
