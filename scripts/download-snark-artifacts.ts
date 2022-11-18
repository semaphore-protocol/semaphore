import download from "download"
import dotenv from "dotenv"

dotenv.config()

async function main() {
    const snarkArtifactsPath = "./snark-artifacts"

    if (process.env.ALL_SNARK_ARTIFACTS === "true") {
        const url = `https://www.trusted-setup-pse.org/semaphore/semaphore.zip`

        await download(url, snarkArtifactsPath, {
            extract: true
        })
    } else {
        const url = `https://www.trusted-setup-pse.org/semaphore/${process.env.TREE_DEPTH || 20}`

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
