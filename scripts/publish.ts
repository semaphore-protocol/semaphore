#!node_modules/.bin/ts-node
import compare from "semver/functions/compare"
import { execSync } from "child_process"
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
        execSync(`soldeer push semaphore-protocol-contracts~${contractsLocalVersion} packages/contracts/contracts`, {
            stdio: "inherit"
        })
}

async function main() {
    // execSync(`yarn build:libraries`, { stdio: "inherit" })
    // execSync(`yarn clean:cli-templates`)
    execSync(`yarn workspaces foreach -A --no-private npm publish --tolerate-republish --access public`, {
        stdio: "inherit"
    })

    await maybePushToSoldeer()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
