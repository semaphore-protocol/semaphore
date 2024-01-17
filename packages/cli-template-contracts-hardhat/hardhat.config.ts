import "@nomiclabs/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import "@semaphore-protocol/hardhat"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/deploy"

dotenvConfig()

function getNetworks(): NetworksUserConfig {
    if (!process.env.INFURA_API_KEY || !process.env.ETHEREUM_PRIVATE_KEY) {
        return {}
    }

    const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]
    const infuraApiKey = process.env.INFURA_API_KEY

    return {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
            chainId: 11155111,
            accounts
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
            chainId: 80001,
            accounts
        },
        "optimism-sepolia": {
            url: `https://optimism-sepolia.infura.io/v3/${infuraApiKey}`,
            chainId: 11155420,
            accounts
        },
        "arbitrum-sepolia": {
            url: "https://sepolia-rollup.arbitrum.io/rpc",
            chainId: 7745327,
            accounts
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            chainId: 42161,
            accounts
        }
    }
}

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
            chainId: 1337
        },
        ...getNetworks()
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
