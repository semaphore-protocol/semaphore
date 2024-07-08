#!node_modules/.bin/ts-node
import { execSync } from "child_process"

async function main() {
    const version = process.argv[2]

    // Perform the workspaces version update
    execSync(`yarn workspaces foreach -A --no-private version -d ${version}`)

    console.log("updated versions")
    // Apply the versions
    execSync("yarn version apply --all")
    console.log("applied versions")
    await import("./remove-stable-version-field")
    console.log("remove stable version")
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
