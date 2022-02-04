import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { resolve } from "path"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/deploy-semaphore-voting"

dotenvConfig({ path: resolve(__dirname, "./.env") })

const hardhatConfig: HardhatUserConfig = {
  solidity: config.solidity,
  paths: {
    sources: config.paths.contracts,
    tests: config.paths.tests,
    cache: config.paths.cache,
    artifacts: config.paths.build.contracts
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
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  typechain: {
    outDir: config.paths.build.typechain,
    target: "ethers-v5"
  }
}

export default hardhatConfig
