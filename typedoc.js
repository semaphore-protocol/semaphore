const fs = require("fs")
const path = require("path")

const EXCLUDE_PKGS = [
    "circuits",
    "cli",
    "cli-template",
    "cli-template-contracts-hardhat",
    "cli-template-monorepo-ethers",
    "cli-template-monorepo-viem",
    "cli-template-monorepo-subgraph",
    "cli-template-contracts-foundry",
    "contracts",
    "core",
    "hardhat"
]
const packagesDir = path.join(__dirname, "packages")
const entryPoints = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !EXCLUDE_PKGS.includes(dirent.name))
    .map((dirent) => path.join("packages", dirent.name))

/** @type {import('typedoc').typedocoptions} */
module.exports = {
    cname: "js.semaphore.pse.dev",
    entryPoints,
    name: "Semaphore SDK",
    entryPointStrategy: "packages"
}
