import { existsSync, readFileSync, writeFileSync } from "node:fs"

async function main() {
    const projectDirectory = `packages/${process.argv[2]}`

    let filePath = `${projectDirectory}/package.json`

    if (existsSync(`${projectDirectory}/contracts/package.json`)) {
        filePath = `${projectDirectory}/contracts/package.json`
    }

    const content = JSON.parse(readFileSync(filePath, "utf8"))

    if (content.stableVersion) {
        delete content.stableVersion
    }

    writeFileSync(filePath, JSON.stringify(content, null, 4), "utf8")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
