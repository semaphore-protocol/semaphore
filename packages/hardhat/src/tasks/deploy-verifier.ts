import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:verifier", "Deploy a Verifier contract")
  .addParam<number>(
    "merkleTreeDepth",
    "Merkle tree depth",
    undefined,
    types.int
  )
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(
    async ({ merkleTreeDepth, logs }, { ethers }): Promise<Contract> => {
      const VerifierContractFactory = await ethers.getContractFactory(
        `Verifier${merkleTreeDepth}`
      )

      const verifierContract = await VerifierContractFactory.deploy()

      await verifierContract.deployed()

      if (logs) {
        console.info(
          `Verifier${merkleTreeDepth} contract has been deployed to: ${verifierContract.address}`
        )
      }

      return verifierContract
    }
  )
