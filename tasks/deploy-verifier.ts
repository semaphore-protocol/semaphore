import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:verifier", "Deploy a Verifier contract")
  .addOptionalParam<number>("depth", "Tree depth", 20, types.int)
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ depth, logs }, { ethers }): Promise<Contract> => {
    const ContractFactory = await ethers.getContractFactory(`Verifier${depth}`)

    const contract = await ContractFactory.deploy()

    await contract.deployed()

    logs && console.log(`Verifier${depth} contract has been deployed to: ${contract.address}`)

    return contract
  })
