import { Contract } from "ethers"
import { task, types } from "hardhat/config"
import { run } from "hardhat"

task("deploy:verifier", "Deploy a Verifier contract")
    .addOptionalParam<number>("depth", "Tree depth", Number(process.env.TREE_DEPTH) || 20, types.int)
    .addOptionalParam<number>("maxEdges", "Number of chains connected", 2, types.int)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ depth, maxEdges, logs }, { ethers }): Promise<Contract> => {
        const ContractFactory = await ethers.getContractFactory(`Verifier${depth}_${maxEdges}`)

        const contract = await ContractFactory.deploy()

        await contract.deployed()

        logs && console.log(`Verifier${depth}_${maxEdges} contract has been deployed to: ${contract.address}`)

        return contract
    })

task("deploy:verifier-selector", "Deploy a Verifier contract")
    .addParam("verifiers", "Tree depths, maxEdges and verifier addresses", undefined, types.json)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ verifiers, logs }, { ethers }): Promise<Contract> => {

        const v2 = verifiers.v2.address;
        const v7 = verifiers.v7.address;

        const ContractFactory = await ethers.getContractFactory(`SemaphoreVerifier`)

        const semaphoreVerifier = await ContractFactory.deploy(v2, v7)

        await semaphoreVerifier.deployed()

        logs && console.log(`SemaphoreVerifier has been deployed to: ${semaphoreVerifier.address}`)

        return semaphoreVerifier
    })
