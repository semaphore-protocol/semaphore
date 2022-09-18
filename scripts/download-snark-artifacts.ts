import download from "download"
import fs from "fs"

async function main() {
    const snarkArtifactsPath = "./snark-artifacts"
    const url = `https://www.trusted-setup-pse.org/semaphore/${process.env.TREE_DEPTH || 20}`

    if (!fs.existsSync(snarkArtifactsPath)) {
        fs.mkdirSync(snarkArtifactsPath, { recursive: true })
    }

    if (!fs.existsSync(`${snarkArtifactsPath}/semaphore.zkey`)) {
        await download(`${url}/semaphore.wasm`, snarkArtifactsPath)
        await download(`${url}/semaphore.zkey`, snarkArtifactsPath)
        await download(`${url}/semaphore.json`, snarkArtifactsPath)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
