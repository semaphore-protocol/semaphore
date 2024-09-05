import { GroupResponse, SemaphoreEthers, SemaphoreSubgraph } from "@semaphore-protocol/data"
import { isSupportedNetwork, supportedNetworks } from "@semaphore-protocol/utils/networks"
import chalk from "chalk"
import { program } from "commander"
import decompress from "decompress"
import figlet from "figlet"
import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "fs"
import logSymbols from "log-symbols"
import pacote from "pacote"
import { dirname } from "path"
import { fileURLToPath } from "url"
import checkLatestVersion from "./checkLatestVersion.js"
import getGroupIds from "./getGroupIds.js"
import { getGroupId, getProjectName, getSupportedNetwork, getSupportedTemplate } from "./inquirerPrompts.js"
import Spinner from "./spinner.js"

// Define the path to the package.json file to extract metadata for the CLI.
const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { description, version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

// List of supported templates for project creation.
const supportedTemplates = [
    {
        value: "monorepo-ethers",
        name: "Hardhat + Next.js + SemaphoreEthers"
    },
    {
        value: "monorepo-subgraph",
        name: "Hardhat + Next.js + SemaphoreSubgraph"
    },
    {
        value: "contracts-hardhat",
        name: "Hardhat"
    }
]

// Setup the CLI program with basic information and help text.
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

// Define the 'create' command to scaffold new Semaphore projects.
program
    .command("create")
    .description("Create a Semaphore project with a supported template.")
    .argument("[project-directory]", "Directory of the project.")
    .option("-t, --template <template-name>", "Supported Semaphore template.")
    .allowExcessArguments(false)
    .action(async (projectDirectory, { template }) => {
        if (!projectDirectory) {
            projectDirectory = await getProjectName()
        }

        if (!template) {
            template = await getSupportedTemplate(supportedTemplates)
        }

        if (!supportedTemplates.some((t) => t.value === template)) {
            console.info(`\n ${logSymbols.error}`, `error: the template '${template}' is not supported\n`)
            return
        }

        const currentDirectory = process.cwd()
        const spinner = new Spinner(`Creating your project in ${chalk.green(`./${projectDirectory}`)}`)

        if (existsSync(projectDirectory)) {
            console.info(`\n ${logSymbols.error}`, `error: the '${projectDirectory}' folder already exists\n`)
            return
        }

        spinner.start()

        await checkLatestVersion(version)

        // Extract the template package into the project directory.
        await pacote.extract(
            `@semaphore-protocol/cli-template-${template}@${version}`,
            `${currentDirectory}/${projectDirectory}`
        )

        // Decompress the template files after extraction.
        await decompress(`${currentDirectory}/${projectDirectory}/files.tgz`, `${currentDirectory}/${projectDirectory}`)

        // Clean up the compressed file after extraction.
        unlinkSync(`${currentDirectory}/${projectDirectory}/files.tgz`)

        // Copy the example environment file to the actual environment file.
        copyFileSync(
            `${currentDirectory}/${projectDirectory}/.env.example`,
            `${currentDirectory}/${projectDirectory}/.env`
        )

        // Create an empty yarn.lock file to install dependencies successfully
        writeFileSync(`${currentDirectory}/${projectDirectory}/yarn.lock`, "")

        spinner.stop()

        console.info(`\n ${logSymbols.success}`, `Your project is ready!\n`)
        console.info(` Please, install your dependencies by running:\n`)
        console.info(`   ${chalk.cyan("cd")} ${projectDirectory}`)
        console.info(`   ${chalk.cyan("yarn install")}\n`)

        // Read the package.json to list available npm scripts.
        const { scripts } = JSON.parse(readFileSync(`${currentDirectory}/${projectDirectory}/package.json`, "utf8"))

        if (scripts) {
            console.info(` Available scripts:\n`)

            console.info(
                `${Object.keys(scripts)
                    .map((s) => `   ${chalk.cyan(`yarn ${s}`)}`)
                    .join("\n")}\n`
            )

            console.info(` See the README.md file to understand how to use them!\n`)
        }
    })

program
    .command("get-groups")
    .description("Get the list of groups from a supported network (e.g. sepolia or arbitrum).")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async ({ network }) => {
        if (!network) {
            network = await getSupportedNetwork(Object.keys(supportedNetworks))
        }

        if (!isSupportedNetwork(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        const groupIds = await getGroupIds(network)

        if (!groupIds || groupIds.length === 0) {
            console.info(`\n ${logSymbols.info}`, `info: there are no groups on the '${network}' network\n`)
            return
        }

        const content = `${chalk.bold("Groups")} (${groupIds.length}): \n${groupIds
            .map((id: any) => ` - ${id}`)
            .join("\n")}`

        console.info(`\n${content}\n`)
    })

program
    .command("get-group")
    .description("Get the data of a group from a supported network (e.g. sepolia or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(Object.keys(supportedNetworks))
        }

        if (!isSupportedNetwork(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (!groupIds || groupIds.length === 0) {
                console.info(`\n ${logSymbols.info}`, `info: there are no groups on the '${network}' network\n`)
                return
            }

            groupId = await getGroupId(groupIds)
        }

        let group: GroupResponse

        const spinner = new Spinner(`Fetching group ${groupId}`)

        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)

            group = await semaphoreSubgraph.getGroup(groupId)

            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)

                group = await semaphoreEthers.getGroup(groupId)

                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
                return
            }
        }

        if (!group) {
            console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
            return
        }

        let content = ` ${chalk.bold("Id")}: ${group.id}\n`
        content += ` ${chalk.bold("Admin")}: ${group.admin}\n`
        content += ` ${chalk.bold("Merkle tree")}:\n`
        content += `   Root: ${group.merkleTree.root}\n`
        content += `   Depth: ${group.merkleTree.depth}\n`
        content += `   Size: ${group.merkleTree.size}`

        console.info(`\n${content}\n`)
    })

program
    .command("get-members")
    .description("Get the members of a group from a supported network (e.g. sepolia or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(Object.keys(supportedNetworks))
        }

        if (!isSupportedNetwork(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (!groupIds || groupIds.length === 0) {
                console.info(`\n ${logSymbols.info}`, `info: there are no groups on the '${network}' network\n`)
                return
            }

            groupId = await getGroupId(groupIds)
        }

        let groupMembers: string[]

        const spinner = new Spinner(`Fetching members of group ${groupId}`)

        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)

            const group = await semaphoreSubgraph.getGroup(groupId, { members: true })
            groupMembers = group.members

            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)

                groupMembers = await semaphoreEthers.getGroupMembers(groupId)

                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
                return
            }
        }

        if (groupMembers.length === 0) {
            console.info(`\n ${logSymbols.info}`, "info: there are no members in this group\n")
            return
        }

        const content = `${chalk.bold("Members")} (${groupMembers.length}): \n${groupMembers
            .map((member: string, i: number) => `   ${i}. ${member}`)
            .join("\n")}`

        console.info(`\n${content}\n`)
    })

program
    .command("get-proofs")
    .description("Get the proofs of a group from a supported network (e.g. sepolia or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(Object.keys(supportedNetworks))
        }

        if (!isSupportedNetwork(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (!groupIds || groupIds.length === 0) {
                console.info(`\n ${logSymbols.info}`, `info: there are no groups on the '${network}' network\n`)
                return
            }

            groupId = await getGroupId(groupIds)
        }

        let validatedProofs: any[]

        const spinner = new Spinner(`Fetching proofs of group ${groupId}`)

        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)

            const group = await semaphoreSubgraph.getGroup(groupId, { validatedProofs: true })
            validatedProofs = group.validatedProofs

            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)

                validatedProofs = await semaphoreEthers.getGroupValidatedProofs(groupId)

                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
                return
            }
        }

        if (validatedProofs.length === 0) {
            console.info(`\n ${logSymbols.info}`, "info: there are no proofs in this group\n")
            return
        }

        const content = `${chalk.bold("Proofs")} (${validatedProofs.length}): \n${validatedProofs
            .map(
                ({ message, merkleTreeRoot, merkleTreeDepth, scope, nullifier, points }: any, i: number) =>
                    `   ${i}. message: ${message} \n      merkleTreeRoot: ${merkleTreeRoot} \n      merkleTreeDepth: ${merkleTreeDepth} \n      scope: ${scope} \n      nullifier: ${nullifier} \n      points: [${points.join(
                        ", "
                    )}]`
            )
            .join("\n")}`

        console.info(`\n${content}\n`)
    })

program.parse(process.argv)
