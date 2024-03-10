/* istanbul ignore file */
import { requireNumber } from "@semaphore-protocol/utils/errors"
import { SnarkArtifacts } from "./types"

/**
 * Returns the zero-knowledge artifact paths. Artifacts exist for each tree
 * depth supported by Semaphore, and they were generated in a trusted-setup.
 * @param treeDepth The depth of the tree.
 * @returns The zero-knowledge artifacts paths.
 */
export default async function getSnarkArtifacts(treeDepth: number): Promise<SnarkArtifacts> {
    requireNumber(treeDepth, "treeDepth")

    return {
        wasmFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.wasm`,
        zkeyFilePath: `https://semaphore.cedoor.dev/artifacts/${treeDepth}/semaphore.zkey`
    }
}
