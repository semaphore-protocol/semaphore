/* istanbul ignore file */
import download from "download"
import fs from "fs"
import tmp from "tmp"
import { SnarkArtifacts } from "./types"

export default async function getSnarkArtifacts(treeDepth: number): Promise<SnarkArtifacts> {
    const tmpDir = "semaphore-proof"
    const tmpPath = `${tmp.tmpdir}/${tmpDir}-${treeDepth}`

    if (!fs.existsSync(tmpPath) || fs.readdirSync(tmpPath).length !== 2) {
        await download(`https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.wasm`, tmpPath)
        await download(`https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.zkey`, tmpPath)
    }

    return {
        wasmFilePath: `${tmpPath}/semaphore.wasm`,
        zkeyFilePath: `${tmpPath}/semaphore.zkey`
    }
}
