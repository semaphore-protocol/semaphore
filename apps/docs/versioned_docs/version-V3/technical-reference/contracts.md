---
sidebar_position: 3
---

# Contracts

Semaphore includes two types of contracts:

-   [**Base contracts**](/docs/technical-reference/contracts#base-contracts)
-   [**Extension contracts**](/docs/technical-reference/contracts#extension-contracts)

And [**Semaphore.sol**](/docs/technical-reference/contracts#semaphoresol), the main contract deployed on the networks supported by Semaphore.

:::info
To use Semaphore contracts and interfaces in your project,
install the [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/main/packages/contracts) NPM package.
:::

## Base contracts

Semaphore provides the following base contracts:

-   [`SemaphoreVerifier.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/base/SemaphoreVerifier.sol): contains a function to verify Semaphore proofs;
-   [`SemaphoreGroups.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/base/SemaphoreGroups.sol): contains the functions to create groups and add/remove/update members.

These contracts are closely related to the protocol.
You can use them in your contract or you can use [**Semaphore.sol**](/docs/technical-reference/contracts#semaphoresol), which integrates them for you.

:::info
While some DApps may use on-chain groups, others may prefer to use off-chain groups, saving only their tree roots in the contract.
:::

## Extension contracts

-   [`SemaphoreVoting.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/extensions/SemaphoreVoting.sol): voting contract that contains the essential functions to create polls, add voters, and anonymously cast votes;
-   [`SemaphoreWhistleblowing.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/extensions/SemaphoreWhistleblowing.sol): whistleblowing contract that contains the essential functions to create entities (for example: non-profit organizations), add whistleblowers, and anonymously publish leaks.

These contracts extend the protocol to provide application logic for specific use-cases.
More extensions will be added in the future.

## Semaphore.sol

[`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/Semaphore.sol) is based on the base contracts. It integrates them and additionally provides:

-   a system to allow only admins (i.e. Ethereum accounts or smart contracts) to manage groups;
-   a mechanism to save the [nullifier hashes](/docs/technical-reference/circuits#nullifier-hash) of each group and prevent double-signaling;
-   a mechanism to allow Semaphore proofs generated with old Merkle roots to be verified for a certain period of time defined by the group admin.

:::info
See our [deployed contracts](/docs/deployed-contracts) to find the addresses for your network.
::::
