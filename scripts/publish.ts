#!/usr/bin/env ts-node
import compare from "semver/functions/compare"
import { execSync } from "child_process"
import contractsPkgJson from "@semaphore-protocol/contracts/package.json"

const { version: contractsLocalVersion } = contractsPkgJson

async function maybePushToSoldeer() {
    const response = await fetch(
        "https://api.soldeer.xyz/api/v1/revision?project_name=semaphore-protocol-contracts&limit=1"
    )
    const { data } = await response.json()

    if (
        data.length === 0 ||
        compare(contractsLocalVersion, data[0]?.version) === 1
    ) {
        execSync(`soldeer push semaphore-protocol-contracts~${contractsLocalVersion} packages/contracts/contracts`, {
            stdio: "inherit"
        })
    }
}

async function main() {
    try {
        execSync(`yarn build:libraries`, { stdio: "inherit" })
        execSync(`yarn clean:cli-templates`)
        execSync(`yarn workspaces foreach -A --no-private npm publish --tolerate-republish --access public`, {
            stdio: "inherit"
        })

        await maybePushToSoldeer()
    } catch (error) {
        console.error("Error executing the script:", error)
        process.exit(1)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in main process:", error)
        process.exit(1)
    })
