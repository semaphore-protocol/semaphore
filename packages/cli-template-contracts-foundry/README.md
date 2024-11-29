# Semaphore Foundry Template

This project demonstrates a basic Semaphore use case. It comes with a sample contract, a test for that contract and a sample script that deploys that contract.

## Prerequisites

This project requires [**Foundry**](https://getfoundry.sh/), and thus a [**Rust environment**](https://www.rust-lang.org/), installed in the machine.

## Install

### Install dependencies

```bash
yarn
```

## Usage

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
yarn test:gas-report
```

### Start a local anvil node

```bash
yarn dev
```

### Code quality and formatting

Run [solhint](https://github.com/protofire/solhint) to analyze the code and catch bugs:

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
