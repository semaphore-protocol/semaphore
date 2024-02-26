# Semaphore Hardhat + Next.js + SemaphoreSubgraph template

This project is a complete application that demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample task that deploys that contract. It also contains a frontend to play around with the contract.

## 📜 Usage

### Add the environment variables

-   Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

-   Copy the `.env.development.local.example` file as `.env.development.local`:

```bash
cp ./apps/web-app/.env.development.local.example ./apps/web-app/.env.development.local
```

-   Copy the `.env.production.local.example` file as `.env.production.local`:

```bash
cp ./apps/web-app/.env.production.local.example ./apps/web-app/.env.production.local
```

Add your environment variables or run the app in a local network.

### Local server

You can start your app locally with:

```bash
yarn dev
```

### Deploy the contract

1. Go to the `apps/contracts` directory and deploy your contract:

```bash
yarn deploy --semaphore <semaphore-address> --group <group-id> --network arbitrum-sepolia
```

2. Update your `.env` file with your new contract address, the group id and the semaphore contract address.

3. Copy your contract artifacts from `apps/contracts/artifacts/contracts/` folder to `apps/web-app/contract-artifacts` folder manually.

> **Note**  
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts).

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
