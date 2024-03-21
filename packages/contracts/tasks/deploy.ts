import { SupportedNetwork } from "@semaphore-protocol/utils"
import { task, types } from "hardhat/config"
import { saveDeployedContracts } from "../scripts/utils"
import { deployContract } from "./utils"

task("deploy", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("verifier", "Verifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, verifier: semaphoreVerifierAddress, poseidon: poseidonT3Address },
            { ethers, hardhatArguments, defender }
        ): Promise<any> => {
            if (!semaphoreVerifierAddress) {
                const VerifierFactory = await ethers.getContractFactory(`SemaphoreVerifier`)

                const verifier = await deployContract(defender, VerifierFactory, hardhatArguments.network)

                semaphoreVerifierAddress = await verifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
                }
            }

            if (!poseidonT3Address) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")

                const poseidonT3 = await deployContract(defender, PoseidonT3Factory, hardhatArguments.network)

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

            const semaphore = await deployContract(defender, SemaphoreFactory, hardhatArguments.network, [
                semaphoreVerifierAddress
            ])

            const semaphoreAddress = await semaphore.getAddress()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)
            }

            const deploymentTransaction = semaphore.deploymentTransaction()

            saveDeployedContracts(
                [
                    {
                        name: "SemaphoreVerifier",
                        address: semaphoreVerifierAddress
                    },
                    {
                        name: "PoseidonT3",
                        address: poseidonT3Address
                    },
                    {
                        name: "Semaphore",
                        address: semaphoreAddress,
                        startBlock:
                            deploymentTransaction && deploymentTransaction.blockNumber
                                ? deploymentTransaction.blockNumber
                                : undefined
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
