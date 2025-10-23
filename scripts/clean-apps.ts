#!/usr/bin/env ts-node
import { readdirSync, rmSync } from "fs"

const folderName = "apps"

const gitIgnored = [
    "node_modules",
    "build",
    ".next",
    "generated",
    "out",
    "subgraph.yaml",
    "tests/.bin",
    ".docusaurus",
    ".cache-loader"
]

async function main() {
    const folders = readdirSync(folderName, { withFileTypes: true })
        .filter((file) => file.isDirectory())
        .map((dir) => dir.name)

    folders.forEach((app) =>
        gitIgnored.forEach((f) => rmSync(`${folderName}/${app}/${f}`, { recursive: true, force: true }))
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
