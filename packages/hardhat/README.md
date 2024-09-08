<p align="center">
    <h1 align="center">
        Semaphore Hardhat plugin
    </h1>
    <p align="center">A Hardhat plugin to deploy Semaphore contracts.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fhardhat?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/hardhat">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/hardhat?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/hardhat">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/hardhat.svg?style=flat-square" />
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
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| The Semaphore Hardhat plugin simplifies the deployment of Semaphore contracts, reducing setup time and complexity. |
| ------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

To install the Semaphore Hardhat plugin, use npm or yarn:

```bash
npm i @semaphore-protocol/hardhat
```

or yarn:

```bash
yarn add @semaphore-protocol/hardhat
```

## 📜 Usage

To use the plugin, import it in your Hardhat configuration file (`hardhat.config.ts`):

```typescript
import "@semaphore-protocol/hardhat"
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
        const { semaphore } = await run("deploy:semaphore", {
            logs
        })

        // Or:
        // const { semaphoreVerifier } = await run("deploy:semaphore-verifier", {
        //    logs
        // })

        const Greeter = await ethers.getContractFactory("Greeter")

        const greeter = await Greeter.deploy(semaphore.address)

        await greeter.deployed()

        if (logs) {
            console.log(`Greeter contract has been deployed to: ${greeter.address}`)
        }

        return greeter
    })
```

### Deploying Contracts

Use the provided tasks to deploy your Semaphore contracts:

```bash
npx hardhat deploy
```

This command will deploy a Semaphore contract using the addresses provided or deploy necessary dependencies like Semaphore Verifier and Poseidon library.
