/* eslint-disable no-console */
import { Subgraph } from "@semaphore-protocol/subgraph"
import chalk from "chalk"
import { program } from "commander"
import figlet from "figlet"
import { readFileSync } from "fs"
import ora from "ora"
import { dirname } from "path"
import { fileURLToPath } from "url"

const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

program
    .name("semaphore")
    .description("A command line tool to set up a Semaphore project and query groups.")
    .version(version, "-v, --version", "Show Semaphore CLI version.")
    .addHelpText("before", `${figlet.textSync("Semaphore CLI")}\n`)
    .helpOption(undefined, "Display this help.")
    .addHelpCommand("help [command]", "Display help for a specific command.")

program
    .command("get-group")
    .description("Get group data from a supported network.")
    .argument("<group-id>", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.", "goerli")
    .option("--members", "Show group members.")
    .option("--signals", "Show group signals.")
    .usage("<group-id> [options]")
    .action(async (groupId, { network, members, signals }) => {
        const subgraph = new Subgraph(network)

        const spinner = ora({
            text: `Fetching group ${groupId}`,
            spinner: "boxBounce"
        }).start()

        const group = await subgraph.getGroup(groupId, { members, verifiedProofs: signals })

        let content = `\n ${chalk.bold("Id")}: ${group.id}\n`
        content += ` ${chalk.bold("Admin")}: ${group.admin}\n`
        content += ` ${chalk.bold("Merkle tree")}:\n`
        content += `   Root: ${group.merkleTree.root}\n`
        content += `   Depth: ${group.merkleTree.depth}\n`
        content += `   Zero value: ${group.merkleTree.zeroValue}\n`
        content += `   Number of leaves: ${group.merkleTree.numberOfLeaves}`

        if (members) {
            content += `\n\n ${chalk.bold("Members")}: \n${group.members
                .map((member: string, i: number) => `   [${i}] ${member}`)
                .join("\n")}`
        }

        if (signals) {
            content += `\n\n ${chalk.bold("Signals")}: \n${group.verifiedProofs
                .map(({ signal }: any, i: number) => `  [${i}] ${signal}`)
                .join("\n")}`
        }

        spinner.stop()

        console.log(`${content}\n`)
    })

program.parse()
