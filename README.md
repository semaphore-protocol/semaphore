<p align="center">
    <h1 align="center">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/semaphore-protocol/.github/main/assets/semaphore-logo-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/semaphore-protocol/.github/main/assets/semaphore-logo-dark.svg">
        <img width="250" alt="Semaphore icon" src="https://raw.githubusercontent.com/semaphore-protocol/.github/main/assets/semaphore-logo-dark.svg">
      </picture>
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
    <a href="http://commitizen.github.io/cz-cli/">
        <img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-586D76?style=flat-square">
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
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://js.semaphore.pse.dev">
            💻 API Reference
        </a>
    </h4>
</div>

| Semaphore is a generic privacy layer. Leveraging zero-knowledge technology, users can prove their membership in groups and send messages (extending from votes to endorsements) off-chain or across EVM-compatible blockchains, all without revealing their personal identity. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

The core of the Semaphore protocol is in the [circuit logic](/packages/circuits/scheme.png). However, Semaphore also provides [Solidity contracts](/packages/contracts) and JavaScript libraries to make the steps for offchain proof creation and onchain/offchain verification easier. To learn more about Semaphore visit [semaphore.pse.dev](https://semaphore.pse.dev).

> [!IMPORTANT]  
> Help Semaphore prosper by sharing your ideas with the PSE [acceleration program](https://github.com/privacy-scaling-explorations/acceleration-program).

## 📦 Packages

<table>
    <th>Package</th>
    <th>Version</th>
    <th>Downloads</th>
    <tbody>
        <tr>
            <td>
                <a href="/packages/core">
                    @semaphore-protocol/core
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/core">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/core.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/core">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/core.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
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
                <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_identity">
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
                <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_group">
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
                <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_proof">
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
                <a href="/packages/data">
                    @semaphore-protocol/data
                </a>
                <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_data">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/data">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/data.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/data">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/data.svg?style=flat-square" alt="Downloads" />
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
        <tr>
            <td>
                <a href="/packages/utils">
                    @semaphore-protocol/utils
                </a>
                <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_utils">
                    (docs)
                </a>
            </td>
            <td>
                <!-- NPM version -->
                <a href="https://npmjs.org/package/@semaphore-protocol/utils">
                    <img src="https://img.shields.io/npm/v/@semaphore-protocol/utils.svg?style=flat-square" alt="NPM version" />
                </a>
            </td>
            <td>
                <!-- Downloads -->
                <a href="https://npmjs.org/package/@semaphore-protocol/utils">
                    <img src="https://img.shields.io/npm/dm/@semaphore-protocol/utils.svg?style=flat-square" alt="Downloads" />
                </a>
            </td>
        </tr>
    </tbody>
</table>

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/semaphore-protocol/semaphore.git
```

Install the dependencies:

```bash
cd semaphore && yarn
```

And build the repository:

```bash
yarn build
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
yarn format
```

Or to automatically format the code:

```bash
yarn format:write
```

### Conventional commits

Semaphore uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). A [command line utility](https://github.com/commitizen/cz-cli) to commit using the correct syntax can be used by running:

```bash
git commit
```

It will also automatically check that the modified files comply with ESLint and Prettier rules.

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

Run [Rollup](https://www.rollupjs.org) and [TheGraph](https://www.npmjs.com/package/@graphprotocol/graph-cli) to build all the packages and the subgraph:

```bash
yarn build
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

### Releases

Bump a new version with:

```bash
yarn version:bump <version>
# e.g. yarn version:bump 2.0.0
```

This step creates a commit and a git tag.

2. Push the changes to main:

```bash
git push origin main
```

3. Push the new git tag:

```bash
git push origin <version>
# e.g. git push origin v2.0.0
```

After pushing the new git tag, a workflow will be triggered to publish the Semaphore packages on [npm](https://www.npmjs.com/) and release a new version on GitHub with its changelogs automatically.
