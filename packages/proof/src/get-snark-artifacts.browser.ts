/* istanbul ignore file */
import { requireNumber } from "@semaphore-protocol/utils/errors"
import { SnarkArtifacts } from "./types"

export default async function getSnarkArtifacts(treeDepth: number): Promise<SnarkArtifacts> {
    requireNumber(treeDepth, "treeDepth")

    return {
        wasmFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.wasm`,
        zkeyFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.zkey`
    }
}
