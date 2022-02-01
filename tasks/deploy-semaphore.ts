import { genExternalNullifier } from "@zk-kit/protocols"
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:semaphore", "Deploy a Semaphore contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)
    // const poseidonT6ABI = poseidonContract.generateABI(5)
    // const poseidonT6Bytecode = poseidonContract.createCode(5)

    const [signer] = await ethers.getSigners()

    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()
    // const PoseidonLibT6Factory = new ethers.ContractFactory(poseidonT6ABI, poseidonT6Bytecode, signer)
    // const poseidonT6Lib = await PoseidonLibT6Factory.deploy()

    await poseidonT3Lib.deployed()
    // await poseidonT6Lib.deployed()

    logs && console.log(`PoseidonT3 library has been deployed to: ${poseidonT3Lib.address}`)
    // logs && console.log(`PoseidonT6 library has been deployed to: ${poseidonT6Lib.address}`)

    const IncrementalMerkleTreeLibFactory = await ethers.getContractFactory("IncrementalTree", {
      libraries: {
        Hash: poseidonT3Lib.address
      }
    })
    const incrementalMerkleTreeLib = await IncrementalMerkleTreeLibFactory.deploy()

    await incrementalMerkleTreeLib.deployed()

    logs && console.log(`IncrementalMerkleTree library has been deployed to: ${incrementalMerkleTreeLib.address}`)

    const ContractFactory = await ethers.getContractFactory("SemaphoreGroups", {
      libraries: {
        IncrementalMerkleTree: incrementalMerkleTreeLib.address
      }
    })

    const contract = await ContractFactory.deploy()

    await contract.deployed()

    logs && console.log(`Semaphore contract has been deployed to: ${contract.address}`)

    return contract
  })
