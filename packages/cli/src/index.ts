import { Subgraph } from "@semaphore-protocol/subgraph"
import chalk from "chalk"
import { program } from "commander"
import download from "download"
import figlet from "figlet"
import { existsSync, readFileSync, renameSync } from "fs"
import logSymbols from "log-symbols"
import { dirname } from "path"
import { fileURLToPath } from "url"
import boxen from "boxen"
import axios from "axios"
import { execSync } from "child_process"
import { lt as semverLt } from "semver"
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
    .argument("<project-directory>", "Directory of the project.")
    // .option("-t, --template <template-name>", "Supported Semaphore template.", "hardhat")
    .action(async (projectDirectory) => {
        const currentDirectory = process.cwd()
        const spinner = new Spinner(`Creating your project in ${chalk.green(`./${projectDirectory}`)}`)
        const templateURL = `https://registry.npmjs.org/@semaphore-protocol/cli-template-hardhat/-/cli-template-hardhat-${version}.tgz`

        const cliRegistryURL = "https://registry.npmjs.org/-/package/@semaphore-protocol/cli/dist-tags"
        let latestVersion

        if (existsSync(projectDirectory)) {
            console.info(`\n ${logSymbols.error}`, `error: the '${projectDirectory}' folder already exists\n`)
            return
        }

        spinner.start()

        /** Checks the registry directly via the API, if that fails,
         * tries the slower `npm view [package] version` command.
         * This is important for users in environments where
         * direct access to npm is blocked by a firewall, and packages are
         * provided exclusively via a private registry.
         */

        try {
            const { data } = await axios.get(cliRegistryURL)
            latestVersion = data.latest
        } catch {
            try {
                latestVersion = execSync("npm view @semaphore-protocol/cli version").toString().trim()
            } catch {
                latestVersion = null
            }
        }

        if (latestVersion && semverLt(version, latestVersion)) {
            console.info(`\n`)
            console.info(
                boxen(
                    chalk.white(
                        `Update available ${chalk.gray(version)} -> ${chalk.green(
                            latestVersion
                        )} \n\n You are currently using @semaphore-protocol/cli ${chalk.gray(
                            version
                        )} which is behind the latest release ${chalk.green(latestVersion)} \n\n Run ${chalk.cyan(
                            "`npm install -g @semaphore-protocol/cli`"
                        )} to get the latest version`
                    ),
                    { padding: 1, borderColor: "yellow", textAlignment: "center" }
                )
            )
            console.info()
        }

        await download(templateURL, currentDirectory, { extract: true })

        renameSync(`${currentDirectory}/package`, `${currentDirectory}/${projectDirectory}`)

        spinner.stop()

        console.info(` ${logSymbols.success}`, `Your project is ready!\n`)
        console.info(` Please, install your dependencies by running:\n`)
        console.info(`   ${chalk.cyan("cd")} ${projectDirectory}`)
        console.info(`   ${chalk.cyan("npm i")}\n`)

        const { scripts } = JSON.parse(readFileSync(`${currentDirectory}/${projectDirectory}/package.json`, "utf8"))

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

program.parse()
