import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { task, types } from "hardhat/config"

task("accounts", "Prints the list of accounts")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }) => {
        const accounts: HardhatEthersSigner[] = await ethers.getSigners()

        if (logs) {
            for (const account of accounts) {
                console.info(await account.getAddress())
            }
        }

        return accounts
    })
