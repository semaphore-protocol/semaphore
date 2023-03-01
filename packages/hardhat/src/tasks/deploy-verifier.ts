import { task, types } from "hardhat/config"

task("deploy:verifer", "Deploy a Verifier contract")
    .addOptionalParam<boolean>("pairing", "Pairing library address", undefined, types.string)
    .addOptionalParam<boolean>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, pairing: pairingAddress, semaphoreVerifier: semaphoreVerifierAddress },
            { ethers }
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
            return {
                pairingAddress,
                semaphoreVerifierAddress
            }
        }
    )
