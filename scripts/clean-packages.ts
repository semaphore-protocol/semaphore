#!/usr/bin/env ts-node
import { readdirSync, rmSync } from "fs"

const folderName = "packages"

const gitIgnored = ["node_modules", "dist", "build", "ptau", "artifacts", "typechain-types", "cache"]

async function main() {
    const folders = readdirSync(folderName, { withFileTypes: true })
        .filter((file) => file.isDirectory())
        .map((dir) => dir.name)

    folders.forEach((app) =>
        gitIgnored.forEach((f) => rmSync(`${folderName}/${app}/${f}`, { recursive: true, force: true }))
    )

    rmSync(`${folderName}/circuit/main`, { recursive: true, force: true })
    rmSync(`${folderName}/circuit/test`, { recursive: true, force: true })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
