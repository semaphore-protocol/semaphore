---
sidebar_position: 3
---

# Contracts

Semaphore includes three types of contracts:

-   [**Base contracts**](/docs/technical-reference/contracts#base-contracts)
-   [**Extension contracts**](/docs/technical-reference/contracts#extension-contracts)
-   [**Verifiers**](/docs/technical-reference/contracts#verifiers)

:::info
To use Semaphore contracts and interfaces in your project,
install the [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts) NPM package.
:::

## Base contracts

Semaphore provides the following base contracts:

-   [`SemaphoreCore.sol`](https://github.com/semaphore-protocol/semaphore/blob/v2.6.1/packages/contracts/contracts/base/SemaphoreCore.sol): contains the functions to verify Semaphore proofs;
-   [`SemaphoreGroups.sol`](https://github.com/semaphore-protocol/semaphore/blob/v2.6.1/packages/contracts/contracts/base/SemaphoreGroups.sol): contains the functions to create groups and add/remove members.

These contracts are closely related to the protocol.
You can inherit them in your contract or you can use [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/Semaphore.sol), which inherits them for you.
See our [deployed contracts](/docs/deployed-contracts#semaphore) to find the addresses for your network.

:::info
While some dApps may use on-chain groups, others may prefer to use off-chain groups, saving only their tree roots in the contract.
:::

## Extension contracts

-   [`SemaphoreVoting.sol`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/extensions/SemaphoreVoting.sol): voting contract that contains the essential functions to create polls, add voters, and anonymously cast votes.
-   [`SemaphoreWhistleblowing.sol`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/extensions/SemaphoreWhistleblowing.sol): whistleblowing contract that contains the essential functions to create entities (for example: non-profit organizations), add whistleblowers, and anonymously publish leaks.

These contracts extend the protocol to provide application logic for specific use-cases.
More extensions will be added in the future.

## Verifiers

To verify Semaphore proofs, the [`SemaphoreCore.sol`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/base/SemaphoreCore.sol) contract requires the address of a deployed verifier contract.
You can choose to manually deploy the [verifier](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/verifiers) you prefer or you can use one of our [deployed verifiers](/docs/deployed-contracts#verifiers).

Each verifier name indicates the tree depth that it can verify.
For example, given a Semaphore proof generated with a tree depth `20`:

-   The `Verifier20.sol` contract can verify the proof.
-   The [group](/docs/guides/groups) used for the proof can have a maximum `2^20=1048576` members.
