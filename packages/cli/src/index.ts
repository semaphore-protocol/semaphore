import { SemaphoreSubgraph, SemaphoreEthers } from "@semaphore-protocol/data"
import chalk from "chalk"
import { program } from "commander"
import download from "download"
import figlet from "figlet"
import { existsSync, readFileSync, renameSync } from "fs"
import inquirer from "inquirer"
import logSymbols from "log-symbols"
import { dirname } from "path"
import { fileURLToPath } from "url"
import checkLatestVersion from "./checkLatestVersion.js"
import Spinner from "./spinner.js"

const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { description, version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

const supportedNetworks = ["sepolia", "goerli", "mumbai", "optimism-goerli", "arbitrum"]

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
    .allowExcessArguments(false)
    .action(async (projectDirectory) => {
        if (!projectDirectory) {
            const { projectName } = await inquirer.prompt({
                name: "projectName",
                type: "input",
                message: "What is your project name?",
                default: "my-app"
            })
            projectDirectory = projectName
        }

        const currentDirectory = process.cwd()
        const spinner = new Spinner(`Creating your project in ${chalk.green(`./${projectDirectory}`)}`)
        const templateURL = `https://registry.npmjs.org/@semaphore-protocol/cli-template-hardhat/-/cli-template-hardhat-${version}.tgz`

        if (existsSync(projectDirectory)) {
            console.info(`\n ${logSymbols.error}`, `error: the '${projectDirectory}' folder already exists\n`)
            return
        }

        spinner.start()

        await checkLatestVersion(version)

        await download(templateURL, currentDirectory, { extract: true })

        renameSync(`${currentDirectory}/package`, `${currentDirectory}/${projectDirectory}`)

        spinner.stop()

        console.info(`\n ${logSymbols.success}`, `Your project is ready!\n`)
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
    .description("Get the list of groups from a supported network (e.g. goerli or arbitrum).")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async ({ network }) => {
        if (!network) {
            const { selectedNetwork } = await inquirer.prompt({
                name: "selectedNetwork",
                type: "list",
                message: "Select one of our supported networks:",
                default: supportedNetworks[0],
                choices: supportedNetworks
            })
            network = selectedNetwork
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        let groupIds

        const spinner = new Spinner("Fetching groups")
        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)
            groupIds = await semaphoreSubgraph.getGroupIds()
            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)
                groupIds = await semaphoreEthers.getGroupIds()
                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: unexpected error with the SemaphoreEthers package")
                return
            }
        }
        if (groupIds.length === 0) {
            console.info(`\n ${logSymbols.info}`, "info: there are no groups in this network\n")
            return
        }

        const content = `\n${groupIds.map((id: any) => ` - ${id}`).join("\n")}`

        console.info(`${content}\n`)
    })

program
    .command("get-group")
    .description("Get the data of a group from a supported network (e.g. goerli or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .option("-m, --members", "Show group members.")
    .option("-s, --signals", "Show group signals.")
    .allowExcessArguments(false)
    .action(async (groupId, { network, members, signals }) => {
        if (!network) {
            const { selectedNetwork } = await inquirer.prompt({
                name: "selectedNetwork",
                type: "list",
                message: "Select one of our supported networks:",
                default: supportedNetworks[0],
                choices: supportedNetworks
            })
            network = selectedNetwork
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            let groupIds

            const spinnerGroups = new Spinner("Fetching groups")
            spinnerGroups.start()

            try {
                const semaphoreSubgraphGroups = new SemaphoreSubgraph(network)
                groupIds = await semaphoreSubgraphGroups.getGroupIds()
                spinnerGroups.stop()
            } catch {
                try {
                    const semaphoreEthersGroups = new SemaphoreEthers(network)
                    groupIds = await semaphoreEthersGroups.getGroupIds()
                    spinnerGroups.stop()
                } catch {
                    spinnerGroups.stop()
                    console.info(`\n ${logSymbols.error}`, "error: unexpected error with the SemaphoreEthers package")
                    return
                }
            }
            if (groupIds.length === 0) {
                console.info(`\n ${logSymbols.info}`, "info: there are no groups in this network\n")
                return
            }

            const { selectedGroupId } = await inquirer.prompt({
                name: "selectedGroupId",
                type: "list",
                message: "Select one of the following existing group ids:",
                choices: groupIds
            })
            groupId = selectedGroupId
        }

        if (!members && !signals) {
            const { showMembers } = await inquirer.prompt({
                name: "showMembers",
                type: "confirm",
                message: "Do you want to show members?",
                default: false
            })

            members = showMembers

            const { showSignals } = await inquirer.prompt({
                name: "showSignals",
                type: "confirm",
                message: "Do you want to show signals?",
                default: false
            })

            signals = showSignals
        }

        let group

        const spinner = new Spinner(`Fetching group ${groupId}`)
        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)
            group = await semaphoreSubgraph.getGroup(groupId, { members, verifiedProofs: signals })
            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)
                group = await semaphoreEthers.getGroup(groupId)
                if (members) {
                    group.members = await semaphoreEthers.getGroupMembers(groupId)
                }
                if (signals) {
                    group.verifiedProofs = await semaphoreEthers.getGroupVerifiedProofs(groupId)
                }
                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
                return
            }
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
    })

program.parse(process.argv)
