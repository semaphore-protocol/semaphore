import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:semaphore", "Deploy a Semaphore contract")
    .addParam("verifiers", "Tree depths and verifier addresses", [], types.json)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, verifiers }, { ethers }): Promise<Contract> => {
        const poseidonABI = poseidonContract.generateABI(2)
        const poseidonBytecode = poseidonContract.createCode(2)

        const [signer] = await ethers.getSigners()

        const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
        const poseidonLib = await PoseidonLibFactory.deploy()

        await poseidonLib.deployed()

        if (logs) {
            console.info(`Poseidon library has been deployed to: ${poseidonLib.address}`)
        }

        const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
            libraries: {
                PoseidonT3: poseidonLib.address
            }
        })
        const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()

        await incrementalBinaryTreeLib.deployed()

        if (logs) {
            console.info(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`)
        }

        const SemaphoreContractFactory = await ethers.getContractFactory("Semaphore", {
            libraries: {
                IncrementalBinaryTree: incrementalBinaryTreeLib.address
            }
        })

        const semaphoreContract = await SemaphoreContractFactory.deploy(verifiers)

        await semaphoreContract.deployed()

        if (logs) {
            console.info(`Semaphore contract has been deployed to: ${semaphoreContract.address}`)
        }

        return semaphoreContract
    })
