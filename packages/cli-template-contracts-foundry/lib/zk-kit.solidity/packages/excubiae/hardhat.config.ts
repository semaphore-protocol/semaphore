import "@nomicfoundation/hardhat-toolbox"
import { HardhatUserConfig } from "hardhat/config"
import "dotenv/config"

const TEST_MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

const hardhatConfig: HardhatUserConfig = {
    networks: {
        hardhat: {
            accounts: {
                mnemonic: TEST_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20
            }
        }
    },
    solidity: {
        version: "0.8.23",
        settings: {
            optimizer: {
                enabled: true
            }
        }
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        outputJSONFile: "gas-report-excubiae.json",
        outputJSON: process.env.REPORT_GAS_OUTPUT_JSON === "true"
    },
    typechain: {
        target: "ethers-v6"
    }
}

export default hardhatConfig
