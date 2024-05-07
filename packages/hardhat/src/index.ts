import { extendConfig } from "hardhat/config"
import { HardhatConfig, HardhatUserConfig } from "hardhat/types"

import "hardhat-dependency-compiler"
import "@nomicfoundation/hardhat-ethers"
import "./tasks/deploy-semaphore"
import "./tasks/deploy-semaphore-verifier"

/**
 * Extends the Hardhat configuration to include paths for dependency compilation.
 * This setup ensures that specific contracts are pre-compiled, optimizing the deployment process.
 * @param config The Hardhat configuration object that is being extended.
 * @param userConfig The user-provided configuration, if any, which may override or extend the default settings.
 */
extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // Default paths for contracts that need to be compiled before deployment.
    config.dependencyCompiler.paths = [
        "@semaphore-protocol/contracts/base/SemaphoreVerifier.sol",
        "@semaphore-protocol/contracts/Semaphore.sol",
        "poseidon-solidity/PoseidonT3.sol"
    ]

    // Merge user-specified paths with the default paths.
    if (userConfig.dependencyCompiler?.paths) {
        config.dependencyCompiler.paths = [...config.dependencyCompiler.paths, ...userConfig.dependencyCompiler.paths]
    }
})
