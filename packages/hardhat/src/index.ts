import { extendConfig } from "hardhat/config"
import { HardhatConfig, HardhatUserConfig } from "hardhat/types"

import "hardhat-dependency-compiler"
import "@nomiclabs/hardhat-ethers"
import "./tasks/deploy-semaphore"
import "./tasks/deploy-verifier"

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.dependencyCompiler.paths = [
      "@webb-tools/semaphore-contracts/verifiers/Verifier16.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier17.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier18.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier19.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier20.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier21.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier22.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier23.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier24.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier25.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier26.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier27.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier28.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier29.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier30.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier31.sol",
      "@webb-tools/semaphore-contracts/verifiers/Verifier32.sol",
      "@webb-tools/semaphore-contracts/Semaphore.sol"
    ]

    if (userConfig.dependencyCompiler?.paths) {
      config.dependencyCompiler.paths = [
        ...config.dependencyCompiler.paths,
        ...userConfig.dependencyCompiler.paths
      ]
    }
  }
)
