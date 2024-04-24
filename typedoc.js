const fs = require("fs")
const path = require("path")

const EXCLUDE_PKGS = [
    "cli-template",
    "cli-template-contracts-hardhat",
    "cli-template-monorepo-ethers",
    "cli-template-monorepo-subgraph",
    "core",
    "circuits",
    "contracts",
    "hardhat",
    "cli"
]
const packagesDir = path.join(__dirname, "packages")
const entryPoints = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !EXCLUDE_PKGS.includes(dirent.name))
    .map((dirent) => path.join("packages", dirent.name))

/** @type {import('typedoc').typedocoptions} */
module.exports = {
    entryPoints,
    name: "Semaphore SDK",
    entryPointStrategy: "packages"
}
