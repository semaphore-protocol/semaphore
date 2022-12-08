import chalk from "chalk"
import { program } from "commander"
import { readFileSync } from "fs"
import { dirname } from "path"
import { fileURLToPath } from "url"

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(`${__dirname}/../package.json`, "utf8"))

program.name("semaphore")
program.version(version)
program.arguments("<project-directory>")
program.usage(`${chalk.green("<project-directory>")} [options]`)

program.option("--first").option("-s, --separator <char>")

program.parse()

const options = program.opts()
const limit = options.first ? 1 : undefined

console.log(program.args[0].split(options.separator, limit))
