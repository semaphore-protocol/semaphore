import { task, types } from "hardhat/config"

task("deploy:imt-test", "Deploy an IMT contract for testing a library")
    .addParam<string>("library", "The name of the library", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam<number>("arity", "The arity of the tree", 2, types.int)
    .setAction(async ({ logs, library: libraryName, arity }, { ethers }): Promise<any> => {
        const PoseidonFactory = await ethers.getContractFactory(`PoseidonT${arity + 1}`)

        const poseidon = await PoseidonFactory.deploy()
        const poseidonAddress = await poseidon.getAddress()

        if (logs) {
            console.info(`PoseidonT${arity + 1} library has been deployed to: ${poseidonAddress}`)
        }

        const LibraryFactory = await ethers.getContractFactory(libraryName, {
            libraries: {
                [`PoseidonT${arity + 1}`]: poseidonAddress
            }
        })

        const library = await LibraryFactory.deploy()
        const libraryAddress = await library.getAddress()

        if (logs) {
            console.info(`${libraryName} library has been deployed to: ${libraryAddress}`)
        }

        const ContractFactory = await ethers.getContractFactory(`${libraryName}Test`, {
            libraries: {
                [libraryName]: libraryAddress
            }
        })

        const contract = await ContractFactory.deploy()
        const contractAddress = await contract.getAddress()

        if (logs) {
            console.info(`${libraryName}Test contract has been deployed to: ${contractAddress}`)
        }

        return { library, contract }
    })
