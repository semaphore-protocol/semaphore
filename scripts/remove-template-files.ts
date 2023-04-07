import { rmSync } from "fs"

async function main() {
    const templates = ["cli-template-monorepo-ethers", "cli-template-monorepo-subgraph"]
    const files: string[] = [
        "contracts/build",
        "contracts/cache",
        "contracts/node_modules",
        "web-app/node_modules",
        "web-app/.next",
        "web-app/next-env.d.ts"
    ]

    templates.map((template) =>
        files.map((file) => rmSync(`packages/${template}/apps/${file}`, { recursive: true, force: true }))
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
