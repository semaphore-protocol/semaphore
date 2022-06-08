<p align="center">
    <h1 align="center">
      <img width="40" src="https://github.com/semaphore-protocol/website/blob/main/static/img/semaphore-icon.svg">  
      Semaphore
    </h1>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/actions?query=workflow%3Atest">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/workflow/status/semaphore-protocol/semaphore/test?label=test&style=flat-square&logo=github">
    </a>
    <a href="https://coveralls.io/github/semaphore-protocol/semaphore">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/semaphore-protocol/semaphore?style=flat-square&logo=coveralls">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/semaphore-protocol/semaphore?style=flat-square">
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
        <a href="https://t.me/joinchat/B-PQx1U3GtAh--Z4Fwo56A">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Semaphore is a protocol, designed to be a simple and generic privacy layer for Ethereum DApps. Using zero knowledge, Ethereum users can prove their membership of a group and send signals such as votes or endorsements without revealing their original identity. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

The core of the Semaphore protocol is in the [circuit logic](/circuits/scheme.png). However Semaphore also provides [Solidity contracts](/contracts) (NPM: `@semaphore-protocol/contracts`) and [JavaScript libraries](https://github.com/semaphore-protocol/semaphore.js) to make the steps for offchain proof creation and onchain verification easier. To learn more about Semaphore visit [semaphore.appliedzkp.org](https://semaphore.appliedzkp.org).

You can find Semaphore V1 on [`version/1.0.0`](https://github.com/semaphore-protocol/semaphore/tree/version/1.0.0).

---

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/semaphore-protocol/semaphore.git
```

and install the dependencies:

```bash
cd semaphore && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables.

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

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

### Compile contracts

Compile the smart contracts with [Hardhat](https://hardhat.org/):

```bash
yarn compile
```

### Testing

Run [Mocha](https://mochajs.org/) to test the contracts:

```bash
yarn test
```

You can also generate a test coverage report:

```bash
yarn test:coverage
```

or a test gas report:

```bash
yarn test:report-gas
```

### Deploy contracts

Deploy a verifier contract with depth = 20:

```bash
yarn deploy:verifier --depth 20
```

Deploy the `Semaphore.sol` contract with one verifier:

```bash
yarn deploy:semaphore --verifiers '[{"merkleTreeDepth": 20, "contractAddress": "0x06bcD633988c1CE7Bd134DbE2C12119b6f3E4bD1"}]'
```

Deploy all verifiers and Semaphore contract:

```bash
yarn deploy:all
```

If you want to deploy contracts in a specific network you can set up the `DEFAULT_NETWORK` variable in your `.env` file with the name of one of our supported networks (hardhat, localhost, goerli, kovan, arbitrum). Or you can specify it as option:

```bash
yarn deploy:all --network kovan
yarn deploy:all --network localhost
```

If you want to deploy contracts on Goerli, Kovan or Arbitrum, remember to provide a valid private key and an Infura API in your `.env` file.
