import fs from "fs"
import logger from "js-logger"
import { zKey } from "snarkjs"
import { config } from "../package.json"

logger.useDefaults()

async function main() {
  const buildPath = config.paths.build["zk-files"]
  const contractsPath = config.paths.contracts
  const templatesPath = config.paths["snarkjs-templates"]
  const solidityVersion = config.solidity.version

  if (fs.existsSync(`${buildPath}/16/semaphore.zkey`)) {
    for (let treeDepth = 16; treeDepth <= 32; treeDepth++) {
      let verifierCode = await zKey.exportSolidityVerifier(
        `${buildPath}/${treeDepth}/semaphore.zkey`,
        { groth16: fs.readFileSync(`${templatesPath}/verifier_groth16.sol.ejs`, "utf8") },
        logger
      )
      verifierCode = verifierCode.replace(/pragma solidity \^\d+\.\d+\.\d+/, `pragma solidity ^${solidityVersion}`)
      verifierCode = verifierCode.replace(/Verifier/, `Verifier${treeDepth}`)

      fs.writeFileSync(`${contractsPath}/verifiers/Verifier${treeDepth}.sol`, verifierCode, "utf-8")
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
