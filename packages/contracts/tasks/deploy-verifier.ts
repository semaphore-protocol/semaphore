import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:verifier", "Deploy a Verifier contract")
  .addOptionalParam<number>(
    "depth",
    "Tree depth",
    Number(process.env.TREE_DEPTH) || 20,
    types.int
  )
  .addOptionalParam<number>(
    "merkleRootSize",
    "Number of chains connected",
    2,
    types.int
  )
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(
    async ({ depth, circuitLength, logs }, { ethers }): Promise<Contract> => {
      const ContractFactory = await ethers.getContractFactory(
        `Verifier${depth}_${circuitLength}`
      )

      const contract = await ContractFactory.deploy()

      await contract.deployed()

      if (logs) {
        console.info(
          `Verifier${depth}_${circuitLength} contract has been deployed to: ${contract.address}`
        )
      }

      return contract
    }
  )

task("deploy:verifier-selector", "Deploy a Verifier contract")
  .addParam(
    "verifiers",
    "Tree depths, circuitLength and verifier addresses",
    undefined,
    types.json
  )
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ verifiers, logs }, { ethers }): Promise<Contract> => {
    const v2 = verifiers.get("v2").address
    const v8 = verifiers.get("v8").address

    if (logs) {
      console.info("v2 address: ", v2)
    }
    if (logs) {
      console.info("v8 address: ", v8)
    }
    const ContractFactory = await ethers.getContractFactory(`SemaphoreVerifier`)

    const semaphoreVerifier = await ContractFactory.deploy(v2, v8)

    // console.log("verifier: ", semaphoreVerifier)
    await semaphoreVerifier.deployed()

    if (logs) {
      console.info(
        `SemaphoreVerifier has been deployed to: ${semaphoreVerifier.address}`
      )
    }

    return semaphoreVerifier
  })
