---
sidebar_position: 2
---

# Contracts

When using Semaphore contracts keep in mind that there are two types of contracts:

- [**Base contracts**](https://github.com/appliedzkp/semaphore/tree/main/contracts/base): they allow you to use the main protocol features (i.e. verify a proof or manage Merkle trees/groups).
- [**Extension contracts**](https://github.com/appliedzkp/semaphore/tree/main/contracts/extensions): they contain application logic and could be used for specific use-cases (e.g. anonymous voting).

Our current available extension contracts can be a good example of how base contracts can be used.

## Base contracts

There are currently two base contracts:

- [**SemaphoreCore.sol**](https://github.com/appliedzkp/semaphore/blob/main/contracts/base/SemaphoreCore.sol): it contains the functions to verify Semaphore proofs and to save the nullifier hash in order to avoid double signaling;
- [**SemaphoreGroups.sol**](https://github.com/appliedzkp/semaphore/blob/main/contracts/base/SemaphoreGroups.sol): it contains the functions to create groups, add or remove members.

These contracts are closely related to the protocol. They are abstract contracts and every function can be overridden, all expect the core ones. The SemaphoreCore contract is always required and devs should always import it, in order to verify their proofs with Semaphore. Some DApps could use the onchain groups, but maybe others can prefer to use their own trees (e.g. offchain trees).

## Extension contracts

- [**SemaphoreVoting.sol**](https://github.com/appliedzkp/semaphore/blob/main/contracts/extensions/SemaphoreVoting.sol): it contains the essential functions to create polls, add voters and cast votes anonymously;
- [**SemaphoreWhistleblowing.sol**](https://github.com/appliedzkp/semaphore/blob/main/contracts/extensions/SemaphoreWhistleblowing.sol): it contains the essential functions to create entities (e.g. non-profit organizations), add whistleblowers and publish leaks anonymously.

These contracts are just extensions of the protocol. More extensions will be added in the future.
