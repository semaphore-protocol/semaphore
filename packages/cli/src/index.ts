import { Subgraph } from "@semaphore-protocol/subgraph"
import chalk from "chalk"
import { program } from "commander"
import download from "download"
import figlet from "figlet"
import { existsSync, readFileSync, renameSync } from "fs"
import logSymbols from "log-symbols"
import { dirname } from "path"
import { fileURLToPath } from "url"
import inquirer from "inquirer"
import checkLatestVersion from "./checkLatestVersion.js"
import Spinner from "./spinner.js"

const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { description, version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

program
    .name("semaphore")
    .description(description)
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
    .command("create")
    .description("Create a Semaphore project with a supported template.")
    .argument("[project-directory]", "Directory of the project.")
    // .option("-t, --template <template-name>", "Supported Semaphore template.", "hardhat")
    .action(async (projectDirectory) => {
        let projectDir: string

        if (!projectDirectory) {
            const answers = await inquirer.prompt({
                name: "project_name",
                type: "input",
                message: "Enter your project name:",
                default: "my-app"
            })
            projectDir = answers.project_name
        } else {
            projectDir = projectDirectory
        }

        const currentDirectory = process.cwd()
        const spinner = new Spinner(`Creating your project in ${chalk.green(`./${projectDir}`)}`)
        const templateURL = `https://registry.npmjs.org/@semaphore-protocol/cli-template-hardhat/-/cli-template-hardhat-${version}.tgz`

        if (existsSync(projectDir)) {
            console.info(`\n ${logSymbols.error}`, `error: the '${projectDir}' folder already exists\n`)
            return
        }

        spinner.start()

        await checkLatestVersion(version)

        await download(templateURL, currentDirectory, { extract: true })

        renameSync(`${currentDirectory}/package`, `${currentDirectory}/${projectDir}`)

        spinner.stop()

        console.info(`\n ${logSymbols.success}`, `Your project is ready!\n`)
        console.info(` Please, install your dependencies by running:\n`)
        console.info(`   ${chalk.cyan("cd")} ${projectDir}`)
        console.info(`   ${chalk.cyan("npm i")}\n`)

        const { scripts } = JSON.parse(readFileSync(`${currentDirectory}/${projectDir}/package.json`, "utf8"))

        if (scripts) {
            console.info(` Available scripts:\n`)

            console.info(
                `${Object.keys(scripts)
                    .map((s) => `   ${chalk.cyan(`npm run ${s}`)}`)
                    .join("\n")}\n`
            )

            console.info(` See the README.md file to understand how to use them!\n`)
        }
    })

program
    .command("get-groups")
    .description("Get the list of groups from a supported network (goerli or arbitrum).")
    .option("-n, --network <network-name>", "Supported Ethereum network.", "goerli")
    .action(async ({ network }) => {
        if (!["goerli", "arbitrum"].includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        const subgraph = new Subgraph(network)
        const spinner = new Spinner("Fetching groups")

        spinner.start()

        try {
            const groups = await subgraph.getGroups()

            spinner.stop()

            if (groups.length === 0) {
                console.info(`\n ${logSymbols.error}`, "error: there are no groups in this network\n")
                return
            }

            const content = `\n${groups.map(({ id }: any) => ` - ${id}`).join("\n")}`

            console.info(`${content}\n`)
        } catch (error) {
            spinner.stop()

            console.info(`\n ${logSymbols.error}`, "error: unexpected error with the Semaphore subgraph")
        }
    })

program
    .command("get-group")
    .description("Get the data of a group from a supported network (Goerli or Arbitrum).")
    .argument("<group-id>", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.", "goerli")
    .option("--members", "Show group members.")
    .option("--signals", "Show group signals.")
    .action(async (groupId, { network, members, signals }) => {
        if (!["goerli", "arbitrum"].includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        const subgraph = new Subgraph(network)
        const spinner = new Spinner(`Fetching group ${groupId}`)

        spinner.start()

        try {
            const group = await subgraph.getGroup(groupId, { members, verifiedProofs: signals })

            spinner.stop()

            if (!group) {
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")

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

            console.info(`\n${content}\n`)
        } catch (error) {
            spinner.stop()

            console.info(`\n ${logSymbols.error}`, "error: unexpected error with the Semaphore subgraph")
        }
    })

program.parse()
