import { SupportedNetwork } from "@semaphore-protocol/utils"
import { task, types } from "hardhat/config"
import { deploy, saveDeployedContracts } from "../scripts/utils"

task("deploy", "Deploy a Semaphore contract")
    .addOptionalParam<string>("verifierKeyPts", "Verifier key points library address", undefined, types.string)
    .addOptionalParam<string>("verifier", "Verifier contract address", undefined, types.string)
    .addOptionalParam<string>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            {
                logs,
                verifierKeyPts: verifierKeyPtsAddress,
                verifier: semaphoreVerifierAddress,
                poseidon: poseidonT3Address
            },
            { ethers, hardhatArguments }
        ): Promise<any> => {
            const startBlock = await ethers.provider.getBlockNumber()

            if (!verifierKeyPtsAddress) {
                verifierKeyPtsAddress = await deploy(ethers, "SemaphoreVerifierKeyPts", hardhatArguments.network)
                logs && console.info(`SemaphoreVerifierKeyPts library has been deployed to: ${verifierKeyPtsAddress}`)
            }

            if (!semaphoreVerifierAddress) {
                semaphoreVerifierAddress = await deploy(ethers, "SemaphoreVerifier", hardhatArguments.network, [], {
                    libraries: {
                        SemaphoreVerifierKeyPts: verifierKeyPtsAddress
                    }
                })
                logs && console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
            }

            if (!poseidonT3Address) {
                poseidonT3Address = await deploy(ethers, "PoseidonT3", hardhatArguments.network)
                logs && console.info(`PoseidonT3 library has been deployed to: ${poseidonT3Address}`)
            }

            const semaphoreAddress = await deploy(
                ethers,
                "Semaphore",
                hardhatArguments.network,
                [semaphoreVerifierAddress],
                {
                    libraries: {
                        PoseidonT3: poseidonT3Address
                    }
                }
            )
            logs && console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)

            saveDeployedContracts(
                [
                    {
                        name: "SemaphoreVerifierKeyPts",
                        address: verifierKeyPtsAddress,
                        startBlock
                    },
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
                semaphore: await ethers.getContractAt("Semaphore", semaphoreAddress),
                verifierAddress: semaphoreVerifierAddress,
                verifierKeyPtsAddress,
                poseidonAddress: poseidonT3Address
            }
        }
    )
