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
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
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
        <a href="https://discord.gg/6mSdGHnstH">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

To learn more about contracts visit [semaphore.appliedzkp.org](https://semaphore.appliedzkp.org/docs/technical-reference/contracts).

---

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

And add your environment variables.

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

Or a test gas report:

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

If you want to deploy contracts in a specific network you can set up the `DEFAULT_NETWORK` variable in your `.env` file with the name of one of our supported networks (hardhat, localhost, goerli, arbitrum). Or you can specify it as option:

```bash
yarn deploy:all --network goerli
yarn deploy:all --network localhost
```

If you want to deploy contracts on Goerli or Arbitrum, remember to provide a valid private key and an Infura API in your `.env` file.
