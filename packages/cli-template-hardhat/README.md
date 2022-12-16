# Semaphore Hardhat template

This project demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample task that deploys that contract.

## Usage

### Compile

```bash
yarn compile
```

### Testing

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

### Deploy

1. Copy the `.env.example` file as `.env`.

```bash
cp .env.example .env
```

2. Add your environment variables.

> **Note**  
> You should at least set a valid Ethereum URL (e.g. Infura) and a private key with some ethers.

3. And deploy your contract.

```bash
yarn deploy --semaphore <semaphore-address> --group <group-id> --network goerli
```

> **Note**  
> Check the Semaphore contract addresses [here](https://semaphore.appliedzkp.org/docs/deployed-contracts#semaphore).

> **Warning**  
> The group id is a number!
