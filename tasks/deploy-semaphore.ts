import { genExternalNullifier } from "@zk-kit/protocols"
import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:semaphore", "Deploy a Semaphore contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .addOptionalParam<number>("depth", "Print the logs", 20, types.int)
  .addOptionalParam<string>("nullifier", "Print the logs", "test", types.string)
  .setAction(async ({ logs, depth, nullifier }, { ethers }): Promise<Contract> => {
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)
    const poseidonT6ABI = poseidonContract.generateABI(5)
    const poseidonT6Bytecode = poseidonContract.createCode(5)

    const [signer] = await ethers.getSigners()

    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()
    const PoseidonLibT6Factory = new ethers.ContractFactory(poseidonT6ABI, poseidonT6Bytecode, signer)
    const poseidonT6Lib = await PoseidonLibT6Factory.deploy()

    await poseidonT3Lib.deployed()
    await poseidonT6Lib.deployed()

    logs && console.log(`PoseidonT3 library has been deployed to: ${poseidonT3Lib.address}`)
    logs && console.log(`PoseidonT6 library has been deployed to: ${poseidonT6Lib.address}`)

    const ContractFactory = await ethers.getContractFactory("Semaphore", {
      libraries: {
        PoseidonT3: poseidonT3Lib.address,
        PoseidonT6: poseidonT6Lib.address
      }
    })

    const contract = await ContractFactory.deploy(depth, genExternalNullifier(nullifier))

    await contract.deployed()

    logs && console.log(`Semaphore contract has been deployed to: ${contract.address}`)

    return contract
  })
