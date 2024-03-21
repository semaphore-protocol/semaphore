import { DefenderHardhatUpgrades } from "@openzeppelin/hardhat-upgrades"
import { ContractFactory } from "ethers"

export async function deployContract(
    defender: DefenderHardhatUpgrades,
    contractFactory: ContractFactory,
    network?: string,
    args: any[] = []
) {
    let contract

    if (network !== undefined && network !== "hardhat" && network !== "localhost") {
        contract = await defender.deployContract(contractFactory, args, { salt: process.env.CREATE2_SALT })
    } else {
        contract = await contractFactory.deploy(...args)
    }

    return contract.waitForDeployment()
}
