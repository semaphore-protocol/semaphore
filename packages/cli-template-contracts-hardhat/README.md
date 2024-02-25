# Semaphore Hardhat template

This project demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample task that deploys that contract.

## Usage

### Install dependencies

```bash
yarn
```

### Compile contracts

```bash
yarn compile
```

### Test contracts

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

1. Copy the `.env.example` file as `.env`.

```bash
cp .env.example .env
```

2. Add your environment variables.

> **Note**  
> You should at least set a valid Ethereum URL (e.g. Infura) and a private key with some ethers.

3. And deploy your contract.

```bash
yarn deploy --semaphore <semaphore-address> --group <group-id> --network sepolia
```

> **Note**  
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts#semaphore).

> **Warning**  
> The group id is a number!

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
