import { Signer } from "@ethersproject/abstract-signer"
import { task, types } from "hardhat/config"

task("accounts", "Prints the list of accounts")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }) => {
        const accounts: Signer[] = await ethers.getSigners()

        if (logs) {
            for (const account of accounts) {
                console.log(await account.getAddress())
            }
        }

        return accounts
    })
