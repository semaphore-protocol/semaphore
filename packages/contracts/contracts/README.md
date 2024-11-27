<p align="center">
    <h1 align="center">
        Semaphore contracts
    </h1>
    <p align="center">Semaphore contracts to manage groups and broadcast anonymous signals.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fcontracts?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/contracts">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/contracts?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/contracts">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/contracts.svg?style=flat-square" />
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

To learn more about contracts visit [semaphore.pse.dev](https://docs.semaphore.pse.dev/technical-reference/contracts).

---

## 🛠 Install

You can install the semaphore protocol contracts with any node package manager (`bun`, `npm`, `pnpm`,`yarn`) or the solidity package manager [`soldeer`](https://soldeer.xyz).

```commandline
bun add @semaphore-protocol/contracts
npm i @semaphore-protocol/contracts
pnpm add @semaphore-protocol/contracts
yarn add @semaphore-protocol/contracts

# for soldeer, an explicit version is required, e.g:
soldeer install semaphore-protocol-contracts~4.6.0
```

## 📜 Usage

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

Or a test gas report:

```bash
yarn test:report-gas
```

### Deploy contracts

Deploy the `Semaphore.sol` contract without any parameter:

```bash
yarn deploy
```

or deploy it by providing the addresses of the contracts/libraries on which it depends:

```bash
yarn deploy --semaphoreVerifier <address>
```

> **Note**  
> Run `yarn deploy:semaphore --help` to see the complete list.

If you want to deploy your contract in a specific network you can set up the `DEFAULT_NETWORK` variable in your `.env` file with the name of one of our supported networks (hardhat, localhost, sepolia, arbitrum). Or you can specify it as an option:

```bash
yarn deploy --network sepolia
yarn deploy --network mumbai
yarn deploy --network optimism-sepolia
yarn deploy --network arbitrum-sepolia
yarn deploy --network arbitrum
```

If you want to deploy contracts on Sepolia or Arbitrum, remember to provide a valid private key and an Infura API in your `.env` file.
