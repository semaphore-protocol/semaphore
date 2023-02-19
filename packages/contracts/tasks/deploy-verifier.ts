
import { task, types } from "hardhat/config"
import { saveVerifierDeployedContracts } from "../scripts/save-deployed-verifier-address"

task("deploy:verifier", "Deploy a Semaphore Verifier contract")
    .addOptionalParam<boolean>("pairing", "Pairing library address", undefined, types.string)
    .addOptionalParam<boolean>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            {
                logs,
                pairing: pairingAddress,
                semaphoreVerifier: semaphoreVerifierAddress
            },
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

            saveVerifierDeployedContracts(hardhatArguments.network, {
                Pairing: pairingAddress,
                SemaphoreVerifier: semaphoreVerifierAddress
            })

            return {
                pairingAddress,
                semaphoreVerifierAddress
            }
        }
    )
