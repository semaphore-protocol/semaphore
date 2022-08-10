import download from "download"
import fs from "fs"
import { config } from "../package.json"

async function main() {
    let treeDepth: number;
    let circuitLength: number;
    if(process.env.TREE_DEPTH) {
        treeDepth = Number(process.env.TREE_DEPTH)
    } else {
        treeDepth = 20
    }
    if(process.env.CIRCUIT_LENGTH) {
        circuitLength = Number(process.env.CIRCUIT_LENGTH)
    } else {
        circuitLength = 2
    }
    const snarkArtifactsPath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/${circuitLength}`
    const url = `https://semaphore-fixtures.s3.amazonaws.com/${treeDepth}/${circuitLength}`

    if (!fs.existsSync(snarkArtifactsPath)) {
        fs.mkdirSync(snarkArtifactsPath, { recursive: true })
    }

    if (!fs.existsSync(`${snarkArtifactsPath}/semaphore.zkey`)) {
        // await download(`https://semaphore-fixtures.s3.amazonaws.com/20/2/semaphore_20_2.wasm`)
        await download(`${url}/semaphore_${treeDepth}_${circuitLength}.wasm`, snarkArtifactsPath)
        await download(`${url}/circuit_final.zkey`, snarkArtifactsPath)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
