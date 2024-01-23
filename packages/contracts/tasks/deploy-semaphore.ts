import { writeFileSync } from "fs"
import { task, types } from "hardhat/config"

task("deploy:semaphore", "Deploy a Semaphore contract")
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

                let verifier

                if (hardhatArguments.network !== undefined && hardhatArguments.network !== "hardhat") {
                    verifier = await defender.deployContract(VerifierFactory, { salt: process.env.CREATE2_SALT })

                    await verifier.waitForDeployment()
                } else {
                    verifier = await VerifierFactory.deploy()
                }

                verifierAddress = await verifier.getAddress()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${verifierAddress}`)
                }
            }

            if (!poseidonAddress) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")

                let poseidonT3

                if (hardhatArguments.network !== undefined && hardhatArguments.network !== "hardhat") {
                    poseidonT3 = await defender.deployContract(PoseidonT3Factory, { salt: process.env.CREATE2_SALT })

                    await poseidonT3.waitForDeployment()
                } else {
                    poseidonT3 = await PoseidonT3Factory.deploy()
                }

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

            let semaphore

            if (hardhatArguments.network !== undefined && hardhatArguments.network !== "hardhat") {
                semaphore = await defender.deployContract(SemaphoreFactory, [verifierAddress], {
                    salt: process.env.CREATE2_SALT,
                    unsafeAllow: ["external-library-linking", "constructor"],
                    unsafeAllowDeployContract: true
                })

                await semaphore.waitForDeployment()
            } else {
                semaphore = await SemaphoreFactory.deploy(verifierAddress)
            }

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
