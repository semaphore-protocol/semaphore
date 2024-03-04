import { readFileSync, readdirSync, writeFileSync } from "node:fs"

const folderName = "packages"

async function main() {
    const filePaths = readdirSync(folderName, { withFileTypes: true })
        .filter((file) => file.isDirectory())
        .map((dir) => (dir.name === "contracts" ? `${dir.name}/contracts` : dir.name))
        .map((name) => `${folderName}/${name}/package.json`)

    for (const filePath of filePaths) {
        const content = JSON.parse(readFileSync(filePath, "utf8"))

        if (content.stableVersion) {
            delete content.stableVersion
        }

        writeFileSync(filePath, JSON.stringify(content, null, 4), "utf8")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
