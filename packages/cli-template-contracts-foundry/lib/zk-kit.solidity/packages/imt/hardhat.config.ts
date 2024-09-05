import "@nomicfoundation/hardhat-toolbox"
import { HardhatUserConfig } from "hardhat/config"
import "./tasks/deploy-imt-test"
import "dotenv/config"

const hardhatConfig: HardhatUserConfig = {
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
        outputJSONFile: "gas-report-imt.json",
        outputJSON: process.env.REPORT_GAS_OUTPUT_JSON === "true"
    },
    typechain: {
        target: "ethers-v6"
    }
}

export default hardhatConfig
