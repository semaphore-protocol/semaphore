<p align="center">
    <h1 align="center">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/semaphore-protocol/website/blob/main/static/img/semaphore-icon-dark.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://github.com/semaphore-protocol/website/blob/main/static/img/semaphore-icon.svg">
        <img width="40" alt="Semaphore icon." src="https://github.com/semaphore-protocol/website/blob/main/static/img/semaphore-icon.svg">
      </picture>
      Semaphore
    </h1>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/actions?query=workflow%3Aproduction">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/actions/workflow/status/semaphore-protocol/semaphore/production.yml?branch=main&label=test&style=flat-square&logo=github">
    </a>
    <a href="https://coveralls.io/github/semaphore-protocol/semaphore">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/semaphore-protocol/semaphore?style=flat-square&logo=coveralls">
    </a>
    <a href="https://deepscan.io/dashboard#view=project&tid=16502&pid=22324&bid=657461">
        <img src="https://deepscan.io/api/teams/16502/projects/22324/branches/657461/badge/grade.svg" alt="DeepScan grade">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/semaphore-protocol/semaphore?style=flat-square">
    <a href="https://www.gitpoap.io/gh/semaphore-protocol/semaphore" target="_blank">
        <img src="https://public-api.gitpoap.io/v1/repo/semaphore-protocol/semaphore/badge">
    </a>

</p>

<div align="center">
    <h4>
        <a href="/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.appliedzkp.org/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Semaphore is a protocol, designed to be a simple and generic privacy layer for Ethereum DApps. Using zero knowledge, Ethereum users can prove their membership of a group and send signals such as votes or endorsements without revealing their original identity. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

The core of the Semaphore protocol is in the [circuit logic](/packages/circuits/scheme.png). However Semaphore also provides [Solidity contracts](/packages/contracts) and JavaScript libraries to make the steps for offchain proof creation and onchain verification easier. To learn more about Semaphore visit [semaphore.appliedzkp.org](https://semaphore.appliedzkp.org).

---

## 📦 Packages

<table>
    <th>Package</th>
    <th>Version</th>
    <th>Downloads</th>
    <tbody>
        <tr>
            <td>
                <a href="/packages/contracts">
                    @semaphore-protocol/contracts
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/contracts">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/contracts.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/contracts">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/contracts.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/identity">
                    @semaphore-protocol/identity
                </a>
                <a href="https://semaphore-protocol.github.io/semaphore/identity">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/identity">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/identity.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/identity">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/identity.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/group">
                    @semaphore-protocol/group
                </a>
                <a href="https://semaphore-protocol.github.io/semaphore/group">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/group">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/group.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/group">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/group.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/proof">
                    @semaphore-protocol/proof
                </a>
                <a href="https://semaphore-protocol.github.io/semaphore/proof">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/proof">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/proof.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/proof">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/proof.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/subgraph">
                    @semaphore-protocol/subgraph
                </a>
                <a href="https://semaphore-protocol.github.io/semaphore/subgraph">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/subgraph">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/subgraph.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/subgraph">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/subgraph.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/hardhat">
                    @semaphore-protocol/hardhat
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/hardhat">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/hardhat.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/hardhat">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/hardhat.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/cli">
                    @semaphore-protocol/cli
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/cli">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/cli.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/cli">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/cli.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
    <tbody>

</table>

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/semaphore-protocol/semaphore.git
```

And install the dependencies:

```bash
cd semaphore && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

And add your environment variables.

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

Or to automatically format the code:

```bash
yarn prettier:write
```

### Conventional commits

Semaphore uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). A [command line utility](https://github.com/commitizen/cz-cli) to commit using the correct syntax can be used by running:

```bash
yarn commit
```

It will also automatically check that the modified files comply with ESLint and Prettier rules.

### Snark artifacts

Download the Semaphore snark artifacts needed to generate and verify proofs:

```bash
yarn download:snark-artifacts
```

### Testing

Run [Jest](https://jestjs.io/) to test the JS libraries:

```bash
yarn test:libraries
```

Run [Mocha](https://mochajs.org/) to test the contracts:

```bash
yarn test:contracts
```

Or test everything with:

```bash
yarn test
```

### Build libraries & compile contracts

Run [Rollup](https://www.rollupjs.org) to build all the packages:

```bash
yarn build:libraries
```

Compile the smart contracts with [Hardhat](https://hardhat.org/):

```bash
yarn compile:contracts
```

### Documentation (JS libraries)

Run [TypeDoc](https://typedoc.org/) to generate a documentation website for each package:

```bash
yarn docs
```

The output will be placed on the `docs` folder.
