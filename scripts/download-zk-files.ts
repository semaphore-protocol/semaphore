import download from "download"
import fs from "fs"
import { config } from "../package.json"

async function main() {
  const buildPath = config.paths.build["zk-files"]
  const url = "http://www.trusted-setup-pse.org/semaphore/semaphore.zip"

  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true })
  }

  if (!fs.existsSync(`${buildPath}/16/semaphore.zkey`)) {
    await download(url, buildPath, {
      extract: true
    })
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
