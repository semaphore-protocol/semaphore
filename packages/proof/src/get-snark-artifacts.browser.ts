/* istanbul ignore file */
import { SnarkArtifacts } from "./types"

export default async function getSnarkArtifacts(treeDepth: number): Promise<SnarkArtifacts> {
    return {
        wasmFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.wasm`,
        zkeyFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.zkey`
    }
}
