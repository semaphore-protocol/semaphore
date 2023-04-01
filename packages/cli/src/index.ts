import { SemaphoreSubgraph, SemaphoreEthers, GroupResponse } from "@semaphore-protocol/data"
import chalk from "chalk"
import { program } from "commander"
import figlet from "figlet"
import { existsSync, readFileSync } from "fs"
import logSymbols from "log-symbols"
import { dirname } from "path"
import { fileURLToPath } from "url"
import pacote from "pacote"
import checkLatestVersion from "./checkLatestVersion.js"
import { getProjectName, getSupportedNetwork, getGroupId } from "./inquirerPrompts.js"
import getGroupIds from "./getGroupIds.js"
import Spinner from "./spinner.js"

const packagePath = `${dirname(fileURLToPath(import.meta.url))}/..`
const { description, version } = JSON.parse(readFileSync(`${packagePath}/package.json`, "utf8"))

const supportedNetworks = ["sepolia", "goerli", "mumbai", "optimism-goerli", "arbitrum", "arbitrum-goerli"]

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
            projectDirectory = await getProjectName()
        }

        const currentDirectory = process.cwd()
        const spinner = new Spinner(`Creating your project in ${chalk.green(`./${projectDirectory}`)}`)

        if (existsSync(projectDirectory)) {
            console.info(`\n ${logSymbols.error}`, `error: the '${projectDirectory}' folder already exists\n`)
            return
        }

        spinner.start()

        await checkLatestVersion(version)

        await pacote.extract(
            `@semaphore-protocol/cli-template-hardhat@${version}`,
            `${currentDirectory}/${projectDirectory}`
        )

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
            network = await getSupportedNetwork(supportedNetworks)
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        const groupIds = await getGroupIds(network)

        if (groupIds === null) return

        const content = `\n${groupIds.map((id: any) => ` - ${id}`).join("\n")}`

        console.info(`${content}\n`)
    })

program
    .command("get-group")
    .description("Get the data of a group from a supported network (e.g. goerli or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(supportedNetworks)
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (groupIds === null) return

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

                group.admin = await semaphoreEthers.getGroupAdmin(groupId)

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

        console.info(`\n${content}\n`)
    })

program
    .command("get-members")
    .description("Get the members of a group from a supported network (e.g. goerli or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(supportedNetworks)
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (groupIds === null) return

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

        const content = `${chalk.bold("Members")}: \n${groupMembers
            .map((member: string, i: number) => `   ${i}. ${member}`)
            .join("\n")}`

        console.info(`\n${content}\n`)
    })

program
    .command("get-proofs")
    .description("Get the proofs from a supported network (e.g. goerli or arbitrum).")
    .argument("[group-id]", "Identifier of the group.")
    .option("-n, --network <network-name>", "Supported Ethereum network.")
    .allowExcessArguments(false)
    .action(async (groupId, { network }) => {
        if (!network) {
            network = await getSupportedNetwork(supportedNetworks)
        }

        if (!supportedNetworks.includes(network)) {
            console.info(`\n ${logSymbols.error}`, `error: the network '${network}' is not supported\n`)
            return
        }

        if (!groupId) {
            const groupIds = await getGroupIds(network)

            if (groupIds === null) return

            groupId = await getGroupId(groupIds)
        }

        let verifiedProofs: any[]

        const spinner = new Spinner(`Fetching proofs of group ${groupId}`)

        spinner.start()

        try {
            const semaphoreSubgraph = new SemaphoreSubgraph(network)

            const group = await semaphoreSubgraph.getGroup(groupId, { verifiedProofs: true })
            verifiedProofs = group.verifiedProofs

            spinner.stop()
        } catch {
            try {
                const semaphoreEthers = new SemaphoreEthers(network)

                verifiedProofs = await semaphoreEthers.getGroupVerifiedProofs(groupId)

                spinner.stop()
            } catch {
                spinner.stop()
                console.info(`\n ${logSymbols.error}`, "error: the group does not exist\n")
                return
            }
        }

        if (verifiedProofs.length === 0) {
            console.info(`\n ${logSymbols.info}`, "info: there are no proofs in this group\n")
            return
        }

        const content = `${chalk.bold("Proofs")}: \n${verifiedProofs
            .map(
                ({ signal, merkleTreeRoot, externalNullifier, nullifierHash }: any, i: number) =>
                    `   ${i}. signal: ${signal} \n      merkleTreeRoot: ${merkleTreeRoot} \n      externalNullifier: ${externalNullifier} \n      nullifierHash: ${nullifierHash}`
            )
            .join("\n")}`

        console.info(`\n${content}\n`)
    })

program.parse(process.argv)
