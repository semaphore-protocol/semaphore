<p align="center">
    <h1 align="center">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/webb-tools/website/blob/main/static/img/semaphore-icon-dark.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://github.com/webb-tools/website/blob/main/static/img/semaphore-icon.svg">
        <img width="40" alt="Semaphore icon." src="https://github.com/webb-tools/website/blob/main/static/img/semaphore-icon.svg">
      </picture>
      Semaphore
    </h1>
</p>

<p align="center">
    <a href="https://github.com/webb-tools" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/webb-tools/semaphore-anchor.svg?style=flat-square">
    </a>
    <a href="https://github.com/webb-tools/semaphore-anchor/actions?query=workflow%3Aproduction">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/workflow/status/webb-tools/semaphore-anchor/production?label=test&style=flat-square&logo=github">
    </a>
    <a href="https://coveralls.io/github/webb-tools/semaphore-anchor">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/webb-tools/semaphore-anchor?style=flat-square&logo=coveralls">
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
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/webb-tools/semaphore-anchor?style=flat-square">
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
        <a href="https://github.com/webb-tools/semaphore-anchor/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://discord.gg/6mSdGHnstH">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Semaphore is a protocol, designed to be a simple and generic privacy layer for Ethereum DApps. Using zero knowledge, Ethereum users can prove their membership of a group and send signals such as votes or endorsements without revealing their original identity. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

The core of the Semaphore protocol is in the [circuit logic](/packages/circuits/scheme.png). However Semaphore also provides [Solidity contracts](/packages/contracts) (NPM: `@webb-tools/contracts`) and JavaScript libraries to make the steps for offchain proof creation and onchain verification easier. To learn more about Semaphore visit [semaphore.appliedzkp.org](https://semaphore.appliedzkp.org).

You can find Semaphore V1 on [`version/1.0.0`](https://github.com/webb-tools/semaphore-anchor/tree/version/1.0.0).

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
                    @webb-tools/contracts
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/contracts">
                    <img src="https://img.shields.io/npm/v/@webb-tools/contracts.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/contracts">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/contracts.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/identity">
                    @webb-tools/identity
                </a>
                <a href="https://webb-tools.github.io/semaphore/identity">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/identity">
                    <img src="https://img.shields.io/npm/v/@webb-tools/identity.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/identity">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/identity.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/group">
                    @webb-tools/group
                </a>
                <a href="https://webb-tools.github.io/semaphore/group">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/group">
                    <img src="https://img.shields.io/npm/v/@webb-tools/group.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/group">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/group.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/proof">
                    @webb-tools/proof
                </a>
                <a href="https://webb-tools.github.io/semaphore/proof">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/proof">
                    <img src="https://img.shields.io/npm/v/@webb-tools/proof.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/proof">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/proof.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/subgraph">
                    @webb-tools/subgraph
                </a>
                <a href="https://webb-tools.github.io/semaphore/subgraph">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/subgraph">
                    <img src="https://img.shields.io/npm/v/@webb-tools/subgraph.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/subgraph">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/subgraph.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
        <tr>
            <td>
                <a href="/packages/hardhat">
                    @webb-tools/semaphore-hardhat
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@webb-tools/semaphore-hardhat">
                    <img src="https://img.shields.io/npm/v/@webb-tools/semaphore-hardhat.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@webb-tools/semaphore-hardhat">
                    <img src="https://img.shields.io/npm/dm/@webb-tools/semaphore-hardhat.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
    <tbody>

</table>

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/webb-tools/semaphore-anchor.git
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
