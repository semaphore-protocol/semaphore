import "@nomicfoundation/hardhat-toolbox"
import "@semaphore-protocol/hardhat"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import "./tasks/deploy"

dotenvConfig()

function getNetworks(): NetworksUserConfig {
    if (process.env.ETHEREUM_URL && process.env.ETHEREUM_PRIVATE_KEY) {
        const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]

        return {
            goerli: {
                url: process.env.ETHEREUM_URL,
                chainId: 5,
                accounts
            },
            arbitrum: {
                url: process.env.ETHEREUM_URL,
                chainId: 42161,
                accounts
            }
        }
    }

    return {}
}

const config: HardhatUserConfig = {
    solidity: "0.8.4",
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
    }
}

export default config
