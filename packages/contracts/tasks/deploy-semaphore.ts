import { task, types } from "hardhat/config"
import { saveDeployedContracts } from "../scripts/utils"

task("deploy:semaphore", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("verifiers", "Verifier contract addresses", undefined, types.json)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, verifiers: verifierAddresses, poseidon: poseidonAddress },
            { ethers, hardhatArguments }
        ): Promise<any> => {
            if (!verifierAddresses) {
                verifierAddresses = []

                for (let i = 0; i < 12; i += 1) {
                    const VerifierFactory = await ethers.getContractFactory(`Verifier${i + 1}`)

                    const verifier = await VerifierFactory.deploy()

                    verifierAddresses.push(await verifier.getAddress())

                    if (logs) {
                        console.info(`SemaphoreVerifier contract has been deployed to: ${verifierAddresses[i]}`)
                    }
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

            const semaphore = await SemaphoreFactory.deploy(verifierAddresses)

            const semaphoreAddress = await semaphore.getAddress()

            if (logs) {
                console.info(`Semaphore contract has been deployed to: ${semaphoreAddress}`)
            }

            saveDeployedContracts(hardhatArguments.network, {
                Verifiers: verifierAddresses,
                Poseidon: poseidonAddress,
                Semaphore: semaphoreAddress
            })

            return {
                semaphore,
                verifierAddresses,
                poseidonAddress
            }
        }
    )
