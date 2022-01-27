import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/config"
import "solidity-coverage"
import { config } from "./package.json"

const hardhatConfig: HardhatUserConfig = {
  solidity: config.solidity,
  paths: {
    sources: config.paths.contracts,
    tests: config.paths.tests,
    cache: config.paths.cache,
    artifacts: config.paths.build.contracts,
    deploy: config.paths.deploy,
    deployments: config.paths.deployments
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true
    },
    localhost: {
      url: "http://localhost:8545",
      allowUnlimitedContractSize: true
    }
  },
  typechain: {
    outDir: config.paths.build.typechain,
    target: "ethers-v5"
  },
  namedAccounts: {
    deployer: 0
  }
}

export default hardhatConfig
