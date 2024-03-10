/* istanbul ignore file */
import { requireNumber } from "@semaphore-protocol/utils/errors"
import { createWriteStream, existsSync, readdirSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import { dirname, join, resolve } from "node:path"
import { Readable } from "node:stream"
import { finished } from "node:stream/promises"
import { SnarkArtifacts } from "./types"
import { compile, createFileManager } from "@noir-lang/noir_wasm"
import { CompiledCircuit } from "@noir-lang/noir_js"

/**
 * A utility function to download the zero-knowledge artifacts from an external server.
 * @param url The URL from which to download the artifacts.
 * @param outputPath The path in which to save the artifacts.
 */
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

/**
 * Downloads the zero-knowledge artifacts and returns their paths.
 * Artifacts exist for each tree depth supported by Semaphore, and
 * they were generated in a trusted-setup.
 * @param treeDepth The depth of the tree.
 * @returns The zero-knowledge artifacts paths.
 */
export default async function getSnarkArtifacts(treeDepth: number): Promise<CompiledCircuit> {
    requireNumber(treeDepth, "treeDepth")

    const data = await readFile(join(__dirname, `../../circuits/compiled/depth_${treeDepth}.json`), "utf-8")

    const compiled = JSON.parse(data) as CompiledCircuit
    return compiled
}
