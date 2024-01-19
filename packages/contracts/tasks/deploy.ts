import { writeFileSync } from "fs"
import { task, types } from "hardhat/config"
import { deployContract } from "./utils"

task("deploy", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("verifier", "Verifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, verifier: verifierAddress, poseidon: poseidonAddress },
            { ethers, hardhatArguments, defender }
        ): Promise<any> => {
            if (!verifierAddress) {
                const VerifierFactory = await ethers.getContractFactory(`SemaphoreVerifier`)

                const verifier = await deployContract(defender, VerifierFactory, hardhatArguments.network)

                verifierAddress = await verifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${verifierAddress}`)
                }
            }

            if (!poseidonAddress) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")

                const poseidonT3 = await deployContract(defender, PoseidonT3Factory, hardhatArguments.network)

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

            const semaphore = await deployContract(defender, SemaphoreFactory, hardhatArguments.network, [
                verifierAddress
            ])

            const semaphoreAddress = await semaphore.getAddress()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)
            }

            writeFileSync(
                `./deployed-contracts/${hardhatArguments.network}.json`,
                JSON.stringify(
                    {
                        Verifier: verifierAddress,
                        Poseidon: poseidonAddress,
                        Semaphore: semaphoreAddress
                    },
                    null,
                    4
                )
            )

            return {
                semaphore,
                verifierAddress,
                poseidonAddress
            }
        }
    )
