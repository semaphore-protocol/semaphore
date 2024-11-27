# Semaphore Foundry Template

This project demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample script that deploys that contract.

## Prerequisites

This project requires [**Foundry**](https://getfoundry.sh/), and thus a [**Rust environment**](https://www.rust-lang.org/), installed in the machine.

## Install

### Install dependencies

```bash
make install
```

## Usage

### Compile contracts

```bash
make build
```

### Test

```bash
make test
```

You can also generate a test coverage report:

```bash
make coverage
```

Or a test gas report:

```bash  
make gas-report
```

### Deploy contracts

1. Copy the `.env.example` file as `.env`.

```bash
cp .env.example .env
```

2. Add your environment variables.

> [!NOTE]
> You should at least set a valid Ethereum URL (e.g. Infura) and a private key with some ethers.

3. And deploy your contract.

```bash
make deploy
```

4. You can also deploy your contract in Sepolia test chain.

```bash
make deploy-sepolia
```

```bash
make deploy-sepolia-verify
```

> [!NOTE]
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts).

### Code quality and formatting

Run [ESLint](https://eslint.org/) and [solhint](https://github.com/protofire/solhint) to analyze the code and catch bugs:

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
