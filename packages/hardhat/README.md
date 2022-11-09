<p align="center">
    <h1 align="center">
        Semaphore Hardhat plugin
    </h1>
    <p align="center">A Semaphore Hardhat plugin to deploy verifiers and Semaphore contracts.</p>
</p>

<p align="center">
    <a href="https://github.com/webb-tools">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/webb-tools/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/webb-tools/semaphore.svg?style=flat-square">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://github.com/webb-tools/semaphore-anchor/blob/develop/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/webb-tools/semaphore-anchor/blob/develop/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/webb-tools/semaphore-anchor/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://discord.gg/zvz9uWr5Me">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This Hardhat plugin provides two simple tasks that can be used to deploy verifiers and Semaphore contracts without any additional configuration. |
| ------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

Install the `@webb-tools/semaphore-hardhat` package with npm:

```bash
npm i @webb-tools/semaphore-hardhat
```

or yarn:

```bash
yarn add @webb-tools/semaphore-hardhat
```

## 📜 Usage

Import the plugin in your `hardhat.config.ts` file:

```typescript
import "@webb-tools/semaphore-hardhat"
import "./tasks/deploy"

const hardhatConfig: HardhatUserConfig = {
    solidity: "0.8.4"
}

export default hardhatConfig
```

And use its tasks to create your own `deploy` task and deploy your contract with a Semaphore address.

```typescript
import { task, types } from "hardhat/config"

task("deploy", "Deploy a Greeter contract")
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers, run }) => {
        const { address: verifierAddress } = await run("deploy:verifier", {
            logs,
            merkleTreeDepth: 20
        })

        const { address: semaphoreAddress } = await run("deploy:semaphore", {
            logs,
            verifiers: [
                {
                    merkleTreeDepth: 20,
                    contractAddress: verifierAddress
                }
            ]
        })

        const Greeter = await ethers.getContractFactory("Greeter")

        const greeter = await Greeter.deploy(semaphoreAddress)

        await greeter.deployed()

        if (logs) {
            console.log(
                `Greeter contract has been deployed to: ${greeter.address}`
            )
        }

        return greeter
    })
```
