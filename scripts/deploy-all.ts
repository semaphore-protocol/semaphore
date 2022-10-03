import fs from "fs"
import { run, hardhatArguments } from "hardhat"
import { VerifierContractInfo } from "../test/utils"

async function main() {
  console.log("Init deploy")
  const deployedContracts: { name: string; address: string }[] = []
  const treeDepth = Number(process.env.TREE_DEPTH) | 20
  const circuitLength = 2

  // Deploy verifiers.
  const { address: v2_address } = await run("deploy:verifier", {
    logs: false,
    depth: treeDepth,
    circuitLength: circuitLength
  })
  const VerifierV2: VerifierContractInfo = {
    name: `Verifier${treeDepth}_${circuitLength}`,
    address: v2_address,
    depth: `${treeDepth}`,
    circuitLength: `2`
  }
  console.log("VerifierV2 deployed to ", v2_address)

  const { address: v7_address } = await run("deploy:verifier", {
    logs: false,
    depth: treeDepth,
    maxEdges: 7
  })
  const VerifierV7: VerifierContractInfo = {
    name: `Verifier${treeDepth}_${7}`,
    address: v7_address,
    depth: `${treeDepth}`,
    circuitLength: `7`
  }
  console.log("VerifierV7 deployed to ", v7_address)

  const deployedVerifiers: Map<string, VerifierContractInfo> = new Map([
    ["v2", VerifierV2],
    ["v7", VerifierV7]
  ])

  const verifierSelector = await run("deploy:verifier-selector", {
    logs: false,
    verifiers: deployedVerifiers
  })
  console.log("verifier-selector deployed to ", verifierSelector.address)

  const contract = await run("deploy:semaphore", {
    logs: false,
    verifiers: [
      { merkleTreeDepth: treeDepth, contractAddress: verifierSelector.address }
    ]
  })
  console.log("Semaphore deployed to ", contract.address)

  deployedContracts.push({
    name: `Semaphore`,
    address: contract.address
  })

  fs.writeFileSync(
    `./deployed-contracts/${hardhatArguments.network}.json`,
    JSON.stringify(deployedContracts, null, 4)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
