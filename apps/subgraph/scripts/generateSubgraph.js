import Mustache from "mustache"
import { readFileSync, writeFileSync } from "fs"

const network = process.argv.at(2)

const template = readFileSync("./subgraph.template.yaml", "utf-8")
const networks = JSON.parse(readFileSync("./networks.json", "utf-8"))
const subgraph = Mustache.render(template, { network, ...networks[network].Semaphore })

writeFileSync("./subgraph.yaml", subgraph)
