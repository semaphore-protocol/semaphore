import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:semaphore", "Deploy a Semaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addParam("verifiers", "Tree depths, maxEdges and verifier addresses", undefined, types.json)
    .setAction(async ({ logs, verifiers }, { ethers }): Promise<Contract> => {
        const poseidonABI = poseidonContract.generateABI(2)
        const poseidonBytecode = poseidonContract.createCode(2)

        const [signer] = await ethers.getSigners()

        const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
        const poseidonLib = await PoseidonLibFactory.deploy()

        await poseidonLib.deployed()

        logs && console.log(`Poseidon library has been deployed to: ${poseidonLib.address}`)

        const LinkableIncrementalBinaryTreeLibFactory = await ethers.getContractFactory("LinkableIncrementalBinaryTree", {
            libraries: {
                PoseidonT3: poseidonLib.address
            }
        })
        const linkableIncrementalBinaryTreeLib = await LinkableIncrementalBinaryTreeLibFactory.deploy()

        await linkableIncrementalBinaryTreeLib.deployed()

        logs && console.log(`LinkableIncrementalBinaryTree library has been deployed to: ${linkableIncrementalBinaryTreeLib.address}`)

        const SemaphoreInputEncoderLibFactory = await ethers.getContractFactory("SemaphoreInputEncoder");
        const semaphoreInputEncoderLib = await SemaphoreInputEncoderLibFactory.deploy()

        await semaphoreInputEncoderLib.deployed()

        logs && console.log(`SemaphoreInputEncoder library has been deployed to: ${semaphoreInputEncoderLib.address}`)

        const ContractFactory = await ethers.getContractFactory("Semaphore", {
            libraries: {
                SemaphoreInputEncoder: semaphoreInputEncoderLib.address,
                LinkableIncrementalBinaryTree: linkableIncrementalBinaryTreeLib.address
            }
        })

        logs && console.log(`contractFactor has been created`)

        const contract = await ContractFactory.deploy(verifiers)

        logs && console.log(`contract deployment has been attempted ${contract}`)

        await contract.deployed()

        logs && console.log(`Semaphore contract has been deployed to: ${contract.address}`)

        return contract
    })
