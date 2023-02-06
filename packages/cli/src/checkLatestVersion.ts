import axios from "axios"
import boxen from "boxen"
import chalk from "chalk"
import { execSync } from "child_process"
import { lt as semverLt } from "semver"

const cliRegistryURL = "https://registry.npmjs.org/-/package/@semaphore-protocol/cli/dist-tags"

/**
 * Checks the registry directly via the API, if that fails, tries the slower `npm view [package] version` command.
 * This is important for users in environments where direct access to npm is blocked by a firewall, and packages are
 * provided exclusively via a private registry.
 * @param currentVersion The current version of the CLI.
 */
export default async function checkLatestVersion(currentVersion: string) {
    let latestVersion: string

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

    if (latestVersion && semverLt(currentVersion, latestVersion)) {
        console.info("\n")
        console.info(
            boxen(
                chalk.white(
                    `Update available ${chalk.gray(currentVersion)} -> ${chalk.green(
                        latestVersion
                    )} \n\n You are currently using @semaphore-protocol/cli ${chalk.gray(
                        currentVersion
                    )} which is behind the latest release ${chalk.green(latestVersion)} \n\n Run ${chalk.cyan(
                        "npm install -g @semaphore-protocol/cli@latest"
                    )} to get the latest version`
                ),
                { padding: 1, borderColor: "yellow", textAlignment: "center" }
            )
        )
        console.info("")
    }
}
