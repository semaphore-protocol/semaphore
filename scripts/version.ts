#!/usr/bin/env ts-node
import { execSync } from "child_process"

async function main() {
    const version = process.argv[2]

    // Perform the workspaces version update
    execSync(`yarn workspaces foreach -A --no-private version -d ${version}`, { stdio: "inherit" })

    // Apply the versions
    execSync("yarn version apply --all", { stdio: "inherit" })

    await import("./remove-stable-version-field")

    execSync("yarn format:write")
    execSync(`NO_HOOK=1 git commit -am 'chore: v${version}'`)
    execSync(`git tag v${version}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
