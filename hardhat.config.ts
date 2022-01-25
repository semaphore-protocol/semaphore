import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/config"

const config: HardhatUserConfig = {
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
    paths: {
        deploy: "deploy",
        deployments: "deployments"
    }
}

export default config
