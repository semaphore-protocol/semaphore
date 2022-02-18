import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:verifier", "Deploy a Verifier contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
    const ContractFactory = await ethers.getContractFactory("Verifier")

    const contract = await ContractFactory.deploy()

    await contract.deployed()

    logs && console.log(`Verifier contract has been deployed to: ${contract.address}`)

    return contract
  })
