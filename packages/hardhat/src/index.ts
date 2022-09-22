import { extendConfig } from "hardhat/config"
import { HardhatConfig, HardhatUserConfig } from "hardhat/types"

import "hardhat-dependency-compiler"
import "@nomiclabs/hardhat-ethers"
import "./tasks/deploy-semaphore"
import "./tasks/deploy-verifier"

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.dependencyCompiler.paths = [
        "@semaphore-protocol/contracts/verifiers/Verifier16.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier17.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier18.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier19.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier20.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier21.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier22.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier23.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier24.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier25.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier26.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier27.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier28.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier29.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier30.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier31.sol",
        "@semaphore-protocol/contracts/verifiers/Verifier32.sol",
        "@semaphore-protocol/contracts/Semaphore.sol"
    ]

    if (userConfig.dependencyCompiler?.paths) {
        config.dependencyCompiler.paths = [...config.dependencyCompiler.paths, ...userConfig.dependencyCompiler.paths]
    }
})
