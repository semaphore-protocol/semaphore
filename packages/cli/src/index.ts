import { Subgraph } from "@semaphore-protocol/subgraph"
import chalk from "chalk"
import { program } from "commander"
import figlet from "figlet"
import { readFileSync } from "fs"
import logSymbols from "log-symbols"
import { dirname } from "path"
import { fileURLToPath } from "url"
import Spinner from "./spinner.js"

const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

program
    .name("semaphore")
    .description("A command line tool to set up your Semaphore project and query groups.")
    .version(version, "-v, --version", "Show Semaphore CLI version.")
    .addHelpText("before", `${figlet.textSync("Semaphore")}\n`)
    .addHelpText("after", "\r")
    .helpOption(undefined, "Display this help.")
    .addHelpCommand("help [command]", "Display help for a specific command.")
    .configureOutput({
        outputError: (message) => {
            console.info(`\n ${logSymbols.error}`, message)
        }
    })

program
    .command("get-group")
    .description("Get the data of a group from a supported network.")
    .argument("<group-id>", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.", "goerli")
    .option("--members", "Show group members.")
    .option("--signals", "Show group signals.")
    .action(async (groupId, { network, members, signals }) => {
        const subgraph = new Subgraph(network)
        const spinner = new Spinner(`Fetching group ${groupId}`)

        spinner.start()

        try {
            const group = await subgraph.getGroup(groupId, { members, verifiedProofs: signals })

            spinner.stop()

            if (!group) {
                console.info(` ${logSymbols.error}`, "error: the group does not exist\n")

                return
            }

            let content = ` ${chalk.bold("Id")}: ${group.id}\n`
            content += ` ${chalk.bold("Admin")}: ${group.admin}\n`
            content += ` ${chalk.bold("Merkle tree")}:\n`
            content += `   Root: ${group.merkleTree.root}\n`
            content += `   Depth: ${group.merkleTree.depth}\n`
            content += `   Zero value: ${group.merkleTree.zeroValue}\n`
            content += `   Number of leaves: ${group.merkleTree.numberOfLeaves}`

            if (members) {
                content += `\n\n ${chalk.bold("Members")}: \n${group.members
                    .map((member: string, i: number) => `   ${i}. ${member}`)
                    .join("\n")}`
            }

            if (signals) {
                content += `\n\n ${chalk.bold("Signals")}: \n${group.verifiedProofs
                    .map(({ signal }: any) => `   - ${signal}`)
                    .join("\n")}`
            }

            console.info(`${content}\n`)
        } catch (error) {
            spinner.stop()

            console.info(` ${logSymbols.error}`, "error: unexpected error with the Semaphore subgraph")
        }
    })

program
    .command("get-groups")
    .description("Get the list of groups from a supported network.")
    .option("-n, --network <network-name>", "Supported Ethereum network.", "goerli")
    .action(async ({ network }) => {
        const subgraph = new Subgraph(network)
        const spinner = new Spinner("Fetching groups")

        spinner.start()

        try {
            const groups = await subgraph.getGroups()

            spinner.stop()

            if (groups.length === 0) {
                console.info(` ${logSymbols.error}`, "error: there are no groups in this network\n")
                return
            }

            const content = `${groups.map(({ id }: any) => ` - ${id}`).join("\n")}`

            console.info(`${content}\n`)
        } catch (error) {
            spinner.stop()

            console.info(` ${logSymbols.error}`, "error: unexpected error with the Semaphore subgraph")
        }
    })

program.parse()
