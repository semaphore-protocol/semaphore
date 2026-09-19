#!/usr/bin/env ts-node
import compare from "semver/functions/compare"
import { spawn } from "child_process"
import contractsPkgJson from "@semaphore-protocol/contracts/package.json"

const { version: contractsLocalVersion } = contractsPkgJson

interface SoldeerResponse {
    data: { version: string }[]
}

function run(command: string, args: string[] = []) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, { stdio: "inherit", shell: true })
        child.on("exit", (code) => {
            if (code === 0) resolve()
            else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`))
        })
    })
}

async function maybePushToSoldeer() {
    const response = await fetch(
        "https://api.soldeer.xyz/api/v1/revision?project_name=semaphore-protocol-contracts&limit=1"
    )
    const { data }: SoldeerResponse = await response.json()

    if (data.length === 0 || compare(contractsLocalVersion, data[0].version) === 1) {
        await run("soldeer", [
            "push",
            `semaphore-protocol-contracts~${contractsLocalVersion}`,
            "packages/contracts/contracts",
        ])
    }
}

async function main() {
    await run("yarn", ["build:libraries"])
    await run("yarn", ["clean:cli-templates"])
    await run("yarn", [
        "workspaces",
        "foreach",
        "-A",
        "--no-private",
        "npm",
        "publish",
        "--tolerate-republish",
        "--access",
        "public",
    ])

    await maybePushToSoldeer()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
