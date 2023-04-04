# Semaphore Hardhat + Next.js + SemaphoreEthers template

This project is a complete application that demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample task that deploys that contract. It also contains a frontend to play around with the contract.

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables or run the app in a local network.

### Local server

You can start your app locally with:

```bash
yarn dev
```

### Deploy the contract

1. Go to the `apps/contracts` directory and deploy your contract:

```bash
yarn deploy --semaphore <semaphore-address> --group <group-id> --network arbitrum-goerli
```

2. Update your `.env` file with your new contract address, the group id and the semaphore contract address.

3. Copy your contract artifacts from `apps/contracts/build/contracts/contracts` folder to `apps/web-app/contract-artifacts` folders manually. Or run `yarn copy:contract-artifacts` in the project root to do it automatically.

> **Note**  
> Check the Semaphore contract addresses [here](https://semaphore.appliedzkp.org/docs/deployed-contracts).

> **Warning**  
> The group id is a number!

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
