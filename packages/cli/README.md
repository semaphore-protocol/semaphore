<p align="center">
    <h1 align="center">
        Semaphore CLI
    </h1>
    <p align="center">A command line tool to set up your Semaphore project and get group data.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fcli?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/cli">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/cli?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/cli">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/cli.svg?style=flat-square" />
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
        <a href="https://github.com/semaphore-protocol/semaphore/issues">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Semaphore CLI simplifies the process of setting up Semaphore projects and retrieving on-chain group data, reducing setup time from minutes to seconds. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

To install Semaphore CLI globally:

```bash
npm i -g @semaphore-protocol/cli
```

Alternatively, you can use `npx` to run commands without installing the package globally:

```bash
npx @semaphore-protocol/cli create my-app
```

This command sets up a new project in the `my-app` directory using the `monorepo-ethers` template.

## 📜 Usage

```
Usage: semaphore [options] [command]

A command line tool to set up your Semaphore project and get group data.

Options:
-v, --version Show Semaphore CLI version.
-h, --help Display this help.

Commands:
  create [options] [project-directory]  Create a Semaphore project with a supported template.
  get-groups [options]                  Get the list of groups from a supported network (e.g. sepolia or arbitrum).
  get-group [options] [group-id]        Get the data of a group from a supported network (e.g. sepolia or arbitrum).
  get-members [options] [group-id]      Get the members of a group from a supported network (e.g. sepolia or arbitrum).
  get-proofs [options] [group-id]       Get the proofs of a group from a supported network (e.g. sepolia or arbitrum).
  help [command]                        Display help for a specific command.
```

## 🌐 Supported Networks

Semaphore CLI supports multiple Ethereum networks. Use the `get-groups` command to interact with groups on networks like Sepolia or Arbitrum.

## 📦 Supported Templates

When creating a new project, you can choose from several templates designed to integrate seamlessly with Semaphore's privacy protocols:

-   **monorepo-ethers**: Hardhat + Next.js + SemaphoreEthers
-   **monorepo-subgraph**: Hardhat + Next.js + SemaphoreSubgraph
-   **contracts-hardhat**: Hardhat only, focused on smart contract development.
