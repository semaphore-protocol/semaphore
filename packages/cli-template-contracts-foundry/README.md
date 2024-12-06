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

You can also start a local [Anvil node](https://book.getfoundry.sh/anvil/) with Semaphore and Feedback contracts deployed on it with:

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

### Integrating with Semaphore Boilerplate

You can also integrate this project with [Semaphore Boilerplate](https://github.com/semaphore-protocol/boilerplate), using this project as the contract end and connecting with Boilerplate front end.

1. In `cli-template-contracts-foundry` package directory, run:

    ```sh
    yarn install
    yarn dev
    ```

    After running `yarn dev`, notice the output of

    ```sh
    # ...
    # ...

    == Return ==
    feedbackAddr: address 0x6f1AFCA8BCA87bF02091AF6187a5002802f9FB31
    semaphoreAddr: address 0xb730ce6CAE3FB706e83E4E00dFA31623966570eB
    semaphoreVerifierAddr: address 0xE2c114f548bEf410eaCe04D0390b61cc963df295

    # ...
    # ...
    ```

2. Now, with another terminal, clone Semaphore Boilerplate down:

    ```sh
    # Clone Semaphore boilerplate and build dependencies
    git clone https://github.com/semaphore-protocol/boilerplate.git
    cd boilerplate
    yarn install

    # Use the sample .env.example
    cp .env.example .env
    ```

3. Open the file `apps/web-app/.env.development`. Modify the values of `NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS` and `NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS` with **feedbackAddr** and **semaphoreAddr** values shown in step 1.

4. Run the Boilerplate front end:

    ```sh
    yarn dev:web-app
    ```
