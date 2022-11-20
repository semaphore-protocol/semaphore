import dotenv from "dotenv"
import download from "download"

dotenv.config()

async function main() {
    const snarkArtifactsPath = "./snark-artifacts"

    if (process.env.ALL_SNARK_ARTIFACTS === "true") {
        const url = `https://www.trusted-setup-pse.org/semaphore/semaphore.zip`

        await download(url, snarkArtifactsPath, {
            extract: true
        })
    } else {
        const treeDepth = process.env.TREE_DEPTH || 20
        const url = `https://www.trusted-setup-pse.org/semaphore/${treeDepth}`

        await download(`${url}/semaphore.wasm`, `${snarkArtifactsPath}/${treeDepth}`)
        await download(`${url}/semaphore.zkey`, `${snarkArtifactsPath}/${treeDepth}`)
        await download(`${url}/semaphore.json`, `${snarkArtifactsPath}/${treeDepth}`)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
