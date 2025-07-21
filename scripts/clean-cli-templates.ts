#!/usr/bin/env ts-node
import { rmSync } from "fs"

const folderName = "packages"

const gitIgnored = [
    "contracts/artifacts",
    "contracts/cache",
    "contracts/node_modules",
    "web-app/node_modules",
    "web-app/.next"
]

const folders = ["cli-template-monorepo-ethers", "cli-template-monorepo-subgraph", "cli-template-monorepo-viem"]

async function main() {
    folders.map((pkg) =>
        gitIgnored.map((f) => rmSync(`${folderName}/${pkg}/apps/${f}`, { recursive: true, force: true }))
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
