import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"
import {
  getDeployedContracts,
  saveDeployedContracts,
  verifiersToSolidityArgument
} from "../scripts/utils"

task("deploy:semaphore", "Deploy a Semaphore contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .addOptionalParam(
    "verifiers",
    "Tree depths and verifier addresses",
    [],
    types.json
  )
  .setAction(
    async (
      { logs, verifiers },
      { ethers, hardhatArguments }
    ): Promise<Contract> => {
      let deployedContracts: any

      if (verifiers.length === 0) {
        deployedContracts = getDeployedContracts(hardhatArguments.network)
        verifiers = verifiersToSolidityArgument(deployedContracts)
      }

      const poseidonABI = poseidonContract.generateABI(2)
      const poseidonBytecode = poseidonContract.createCode(2)

      const [signer] = await ethers.getSigners()

      const PoseidonLibFactory = new ethers.ContractFactory(
        poseidonABI,
        poseidonBytecode,
        signer
      )
      const poseidonLib = await PoseidonLibFactory.deploy()

      await poseidonLib.deployed()

      if (logs) {
        console.info(
          `Poseidon library has been deployed to: ${poseidonLib.address}`
        )
      }

      const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory(
        "IncrementalBinaryTree",
        {
          libraries: {
            PoseidonT3: poseidonLib.address
          }
        }
      )
      const incrementalBinaryTreeLib =
        await IncrementalBinaryTreeLibFactory.deploy()

      await incrementalBinaryTreeLib.deployed()

      if (logs) {
        console.info(
          `IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`
        )
      }

      const ContractFactory = await ethers.getContractFactory("Semaphore", {
        libraries: {
          IncrementalBinaryTree: incrementalBinaryTreeLib.address
        }
      })

      const contract = await ContractFactory.deploy(verifiers)

      await contract.deployed()

      if (logs) {
        console.info(
          `Semaphore contract has been deployed to: ${contract.address}`
        )
      }

      if (deployedContracts) {
        deployedContracts.PoseidonT3 = poseidonLib.address
        deployedContracts.IncrementalBinaryTree =
          incrementalBinaryTreeLib.address
        deployedContracts.Semaphore = contract.address

        saveDeployedContracts(hardhatArguments.network, deployedContracts)
      }

      return contract
    }
  )
