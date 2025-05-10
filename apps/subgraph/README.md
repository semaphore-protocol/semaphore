<h1 align="center">
    Semaphore Subgraph
</h1>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
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
        <a href="https://github.com/semaphore-protocol/semaphore/issues/new/choose">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| The Graph is an indexing protocol for querying networks like Ethereum and IPFS. Our subgraphs allow you to get data from the [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/Semaphore.sol) smart contract. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## Networks

You can access any subgraph supported by Semaphore with the following URL: `https://api.studio.thegraph.com/query/14377/semaphore-<network-name>/v4.2.0`.

Supported networks:

-   `sepolia`
-   `ethereum`
-   `optimism`
-   `optimism-sepolia`
-   `arbitrum`
-   `arbitrum-sepolia`
-   `matic`
-   `matic-amoy`
-   `base-sepolia`
-   `base`
-   `linea-sepolia`
-   `linea`
-   `scroll-sepolia`

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/semaphore-protocol/semaphore.git
```

and install the dependencies:

```bash
cd semaphore/apps/subgraph && yarn
```

## Usage

The subgraph definition consists of a few files:

-   `subgraph.template.yaml`: a YAML file containing the subgraph manifest,
-   `schema.graphql`: a GraphQL schema that defines what data is stored for the subgraph, and how to query it via GraphQL,
-   `src/semaphore.ts`: AssemblyScript code that translates from the event data to the entities defined in the schema.

### Code generation

Generate AssemblyScript types for the subgraph (required every time the schema changes):

```bash
yarn codegen <network>
```

It also generates a `subgraph.yaml` file for your specific network.

### Testing

After generating the types and `subgraph.yaml` file, test your subgraph:

```bash
yarn test
```

### Deployment

#### TheGraph Studio

Set the authorization code that links your account on thegraph.com:

```bash
yarn auth <access-token>
```

Deploy the subgraph to the [TheGraph Studio](https://thegraph.com/studio/):

```bash
yarn deploy <subgraph-name>
```

#### Local

Start services required for TheGraph node by running:

```bash
docker compose up
```

Start a local Hardhat node and deploy the [Semaphore contract](https://github.com/semaphore-protocol/semaphore/tree/main/packages/contracts):

```bash
# CWD = /semaphore/packages/contracts
yarn start --hostname 0.0.0.0
yarn deploy --network localhost
```

Create the `subgraph.yaml` file for your local network and create/deploy your subgraph:

```bash
yarn codegen localhost
yarn create-local
yarn deploy-local
```

Once the subgraph is published it will start indexing. You can query the subgraph using the following GraphQL endpoint:

```
http://127.0.0.1:8000/subgraphs/name/semaphore/graphql
```
