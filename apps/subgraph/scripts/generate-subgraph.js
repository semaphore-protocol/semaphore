import { getDeployedContract } from "@semaphore-protocol/utils"
import { readFileSync, writeFileSync } from "fs"
import Mustache from "mustache"

const network = process.argv.at(2)

const template = readFileSync("./subgraph.template.yaml", "utf-8")

const subgraph = Mustache.render(template, { network, ...getDeployedContract(network) })

writeFileSync("./subgraph.yaml", subgraph)
