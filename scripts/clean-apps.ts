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
    const apps = readdirSync(folderName, { withFileTypes: true })
        .filter((file) => file.isDirectory())
        .map((dir) => dir.name)

    apps.map((app) => gitIgnored.map((f) => rmSync(`${folderName}/${app}/${f}`, { recursive: true, force: true })))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
