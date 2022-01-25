import { config } from "./package.json"
import { HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"

const hardhatConfig: HardhatUserConfig = {
    solidity: {
        version: "0.8.4",
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
        localhost: {
            url: "http://localhost:8545",
            allowUnlimitedContractSize: true
        }
    },
    namedAccounts: {
        deployer: 0
    },
    paths: config.paths
}

export default hardhatConfig
