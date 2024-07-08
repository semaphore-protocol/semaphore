import { execa } from "execa"
import compare from "semver/functions/compare"

import contractsPkgJson from "@semaphore-protocol/contracts/package.json"

const { version: contractsLocalVersion } = contractsPkgJson

async function getContractsLatestPublishedVersion() {
    const response = await fetch("https://registry.npmjs.org/@semaphore-protocol/contracts")
    const data = await response.json()
    return data["dist-tags"].latest
}

async function maybePushToSoldeer() {
    const contractsLatestPublishedVersion = await getContractsLatestPublishedVersion()
    if (compare(contractsLocalVersion, contractsLatestPublishedVersion) === 1)
        await execa(
            "soldeer",
            ["push", `semaphore-protocol-contracts~${contractsLocalVersion}`, "packages/contracts/contracts"],
            { stdio: "inherit" }
        )
}

async function main() {
    try {
        await execa("yarn", ["build:libraries"], { stdio: "inherit" })
        await execa("yarn", ["clean:cli-templates"], { stdio: "inherit" })
        await execa(
            "yarn",
            [
                "workspaces",
                "foreach",
                "-A",
                "--no-private",
                "npm",
                "publish",
                "--tolerate-republish",
                "--access",
                "public"
            ],
            { stdio: "inherit" }
        )

        await maybePushToSoldeer()

        // read
        console.log("Build and publish script completed successfully.")
    } catch (error) {
        console.error("An error occurred:", error)
        process.exit(1)
    }
}

main()
