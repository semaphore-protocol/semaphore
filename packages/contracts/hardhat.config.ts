import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-verify"
import { getHardhatNetworks } from "@semaphore-protocol/utils"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { resolve } from "path"
import "solidity-coverage"
import "./tasks/accounts"
import "./tasks/deploy"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

const hardhatConfig: HardhatUserConfig = {
    solidity: {
        version: "0.8.23",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            chainId: 1337,
            allowUnlimitedContractSize: true
        },
        ...getHardhatNetworks(process.env.BACKEND_PRIVATE_KEY)
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        target: "ethers-v6"
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        customChains: [
            {
                network: "optimism-sepolia",
                chainId: 11155420,
                urls: {
                    apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
                    browserURL: "https://sepolia-optimistic.etherscan.io"
                }
            },
            {
                network: "linea-sepolia",
                chainId: 59141,
                urls: {
                    apiURL: "https://api-sepolia.lineascan.build/api",
                    browserURL: "https://sepolia.lineascan.build"
                }
            },
            {
                network: "linea",
                chainId: 59144,
                urls: {
                    apiURL: "https://api.lineascan.build/api",
                    browserURL: "https://lineascan.build"
                }
            },
            {
                network: "scroll-sepolia",
                chainId: 534351,
                urls: {
                    apiURL: "https://api-sepolia.scrollscan.com/api",
                    browserURL: "https://sepolia.scrollscan.com"
                }
            },
            {
                network: "gnosis-chiado",
                chainId: 10200,
                urls: {
                    apiURL: "https://gnosis-chiado.blockscout.com/api",
                    browserURL: "https://gnosis-chiado.blockscout.com"
                }
            },
            {
                network: "gnosis",
                chainId: 100,
                urls: {
                    apiURL: "https://api.etherscan.io/v2/api?chainid=100",
                    browserURL: "https://gnosisscan.io"
                }
            }
        ]
    },
    sourcify: {
        enabled: true
    }
}

export default hardhatConfig
