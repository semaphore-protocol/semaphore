import { execa } from "execa"
import compare from "semver/functions/compare"

import contractsPkgJson from "@semaphore-protocol/contracts/package.json"

const { version: contractsLocalVersion } = contractsPkgJson

async function maybePushToSoldeer() {
    // api not documented, may change, found by inspecting the network tab
    const response = await fetch(
        "https://api.soldeer.xyz/api/v1/revision?project_name=semaphore-protocol-contracts&limit=1"
    )
    const { data, status } = await response.json()

    // fail status is no version published at all yet
    if (status === "fail" || compare(contractsLocalVersion, data[0].version) === 1)
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
