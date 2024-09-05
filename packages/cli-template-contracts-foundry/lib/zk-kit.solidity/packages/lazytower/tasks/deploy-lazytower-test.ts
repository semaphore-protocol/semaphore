import { task, types } from "hardhat/config"

task("deploy:lazytower-test", "Deploy a LazyTowerHashChainTest contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }): Promise<any> => {
        const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")

        const poseidonT3 = await PoseidonT3Factory.deploy()
        const poseidonT3Address = await poseidonT3.getAddress()

        if (logs) {
            console.info(`PoseidonT3 library has been deployed to: ${poseidonT3Address}`)
        }

        const LazyTowerLibFactory = await ethers.getContractFactory("LazyTowerHashChain", {
            libraries: {
                PoseidonT3: poseidonT3Address
            }
        })

        const lazyTowerLib = await LazyTowerLibFactory.deploy()
        const lazyTowerLibAddress = await lazyTowerLib.getAddress()

        if (logs) {
            console.info(`LazyTowerHashChain library has been deployed to: ${lazyTowerLibAddress}`)
        }

        const ContractFactory = await ethers.getContractFactory("LazyTowerHashChainTest", {
            libraries: {
                LazyTowerHashChain: lazyTowerLibAddress
            }
        })

        const contract = await ContractFactory.deploy()
        const contractAddress = await lazyTowerLib.getAddress()

        if (logs) {
            console.info(`Test contract has been deployed to: ${contractAddress}`)
        }

        return contract
    })
