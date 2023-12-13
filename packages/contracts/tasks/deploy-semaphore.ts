import { task, types } from "hardhat/config"
import { saveDeployedContracts } from "../scripts/utils"

task("deploy:semaphore", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("pairing", "Pairing library address", undefined, types.string)
    .addOptionalParam<boolean>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, pairing: pairingAddress, semaphoreVerifier: semaphoreVerifierAddress, poseidon: poseidonAddress },
            { ethers, hardhatArguments }
        ): Promise<any> => {
            if (!semaphoreVerifierAddress) {
                if (!pairingAddress) {
                    const PairingFactory = await ethers.getContractFactory("Pairing")
                    const pairing = await PairingFactory.deploy()

                    await pairing.deployed()

                    if (logs) {
                        console.info(`Pairing library has been deployed to: ${pairing.address}`)
                    }

                    pairingAddress = pairing.address
                }

                const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier", {
                    libraries: {
                        Pairing: pairingAddress
                    }
                })

                const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

                await semaphoreVerifier.deployed()

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifier.address}`)
                }

                semaphoreVerifierAddress = semaphoreVerifier.address
            }

            if (!poseidonAddress) {
                const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
                const poseidonT3 = await PoseidonT3Factory.deploy()

                await poseidonT3.deployed()

                if (logs) {
                    console.info(`Poseidon library has been deployed to: ${poseidonT3.address}`)
                }

                poseidonAddress = poseidonT3.address
            }

            const SemaphoreFactory = await ethers.getContractFactory("Semaphore", {
                libraries: {
                    PoseidonT3: poseidonAddress
                }
            })

            const semaphore = await SemaphoreFactory.deploy(semaphoreVerifierAddress)

            await semaphore.deployed()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphore.address}`)
            }

            saveDeployedContracts(hardhatArguments.network, {
                Pairing: pairingAddress,
                SemaphoreVerifier: semaphoreVerifierAddress,
                Poseidon: poseidonAddress,
                Semaphore: semaphore.address
            })

            return {
                semaphore,
                pairingAddress,
                semaphoreVerifierAddress,
                poseidonAddress
            }
        }
    )
