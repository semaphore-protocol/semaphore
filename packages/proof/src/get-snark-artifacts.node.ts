/* istanbul ignore file */
import { requireNumber } from "@semaphore-protocol/utils/errors"
import { createWriteStream, existsSync, readdirSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import os from "node:os"
import { dirname } from "node:path"
import { Readable } from "node:stream"
import { finished } from "node:stream/promises"
import { SnarkArtifacts } from "./types"

async function download(url: string, outputPath: string) {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    // Ensure the directory exists.
    const dir = dirname(outputPath)
    await mkdir(dir, { recursive: true })

    const fileStream = createWriteStream(outputPath)
    await finished(Readable.fromWeb(response.body as any).pipe(fileStream))
}

export default async function getSnarkArtifacts(treeDepth: number): Promise<SnarkArtifacts> {
    requireNumber(treeDepth, "treeDepth")

    const tmpDir = "semaphore-proof"
    const tmpPath = `${os.tmpdir()}/${tmpDir}-${treeDepth}`

    if (!existsSync(tmpPath) || readdirSync(tmpPath).length !== 2) {
        await download(
            `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.wasm`,
            `${tmpPath}/semaphore.wasm`
        )
        await download(
            `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.zkey`,
            `${tmpPath}/semaphore.zkey`
        )
    }

    return {
        wasmFilePath: `${tmpPath}/semaphore.wasm`,
        zkeyFilePath: `${tmpPath}/semaphore.zkey`
    }
}
