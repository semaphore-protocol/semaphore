import axios from "axios"
import boxen from "boxen"
import chalk from "chalk"
import { execSync } from "child_process"
import { lt as semverLt } from "semver"

const cliRegistryURL = "https://registry.npmjs.org/-/package/@semaphore-protocol/cli/dist-tags"

/**
 * Checks for the latest version of the CLI tool against the registry. It first attempts to fetch the version directly
 * via an API call. If this fails, possibly due to network restrictions, it falls back to using the `npm view` command.
 * This method ensures that users behind a firewall or using a private registry can still check for updates.
 * @param currentVersion The current version of the CLI being used.
 */
export default async function checkLatestVersion(currentVersion: string) {
    let latestVersion: string

    try {
        const { data } = await axios.get(cliRegistryURL, { timeout: 5000 })

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
