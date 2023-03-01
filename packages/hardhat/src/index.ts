import { extendConfig } from "hardhat/config"
import { HardhatConfig, HardhatUserConfig } from "hardhat/types"

import "hardhat-dependency-compiler"
import "@nomiclabs/hardhat-ethers"
import "./tasks/deploy-semaphore"
import "./tasks/deploy-semaphore-verifier"

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.dependencyCompiler.paths = [
        "@semaphore-protocol/contracts/base/Pairing.sol",
        "@semaphore-protocol/contracts/base/SemaphoreVerifier.sol",
        "@semaphore-protocol/contracts/Semaphore.sol"
    ]

    if (userConfig.dependencyCompiler?.paths) {
        config.dependencyCompiler.paths = [...config.dependencyCompiler.paths, ...userConfig.dependencyCompiler.paths]
    }
})
