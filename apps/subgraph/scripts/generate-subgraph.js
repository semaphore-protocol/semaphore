import { getDeployedContract } from "@semaphore-protocol/utils"
import { readFileSync, writeFileSync } from "fs"
import Mustache from "mustache"

const network = process.argv.at(2)

const template = readFileSync("./subgraph.template.yaml", "utf-8")

function mapNetwork(n) {
    if (n === "matic-amoy") {
        return "polygon-amoy"
    }

    if (n === "arbitrum") {
        return "arbitrum-one"
    }

    if (n === "ethereum") {
        return "mainnet"
    }

    return network
}

const subgraph = Mustache.render(template, {
    network: mapNetwork(network),
    ...getDeployedContract(network)
})

writeFileSync("./subgraph.yaml", subgraph)
