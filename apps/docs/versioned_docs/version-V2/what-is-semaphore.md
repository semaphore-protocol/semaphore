---
id: introduction
title: What Is Semaphore?
sidebar_position: 1
slug: /
---

## Overview

[Semaphore](https://github.com/semaphore-protocol/semaphore) is a [zero-knowledge](https://z.cash/technology/zksnarks) protocol that allows you to cast a signal (for example, a vote or endorsement) as a provable group member without revealing your identity.
Additionally, it provides a simple mechanism to prevent double-signaling.
Use cases include private voting, whistleblowing, anonymous DAOs and mixers.

## Features

With Semaphore, you can allow your users to do the following:

1. [Create a Semaphore identity](/guides/identities/).
2. [Add their Semaphore identity to a group (i.e. _Merkle tree_)](/guides/groups/).
3. [Send a verifiable, anonymous signal (e.g a vote or endorsement)](/guides/proofs/).

When a user broadcasts a signal (for example: a vote), Semaphore zero-knowledge
proofs can ensure that the user has joined the group and hasn't already cast a signal with their nullifier.

Semaphore uses on-chain Solidity contracts and off-chain JavaScript libraries that work in tandem.

-   Off chain, JavaScript libraries can be used to create identities, manage groups and generate proofs.
-   On chain, Solidity contracts can be used to manage groups and verify proofs.

## Developer benefits

Semaphore is designed to be a simple and generic _privacy layer_ for decentralized applications (dApps) on Ethereum. It encourages modular application design, allowing dApp developers to choose and customize the on-chain and off-chain components they need.

## About the code

The core of the protocol is the [circuit logic](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/circuits/scheme.png).
In addition to circuits,
Semaphore provides [Solidity contracts](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts)
and [JavaScript libraries](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1#-packages) that allow developers to generate zero-knowledge proofs and verify them with minimal effort.

### Audits

| Version | Report                                                                                                               | Scope                    |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| v2.0.0  | [Semaphore_2.0.0_Audit.pdf](https://github.com/semaphore-protocol/semaphore/files/9850441/Semaphore_2.0.0_Audit.pdf) | `circuits`, `contracts`  |
| v2.5.0  | [Semaphore_2.5.0_Audit.pdf](https://github.com/semaphore-protocol/semaphore/files/9845008/Semaphore_2.5.0_Audit.pdf) | `contracts`, `libraries` |

:::info
If you are using the previous version of Semaphore, see the [Semaphore V1](/V1) documentation.
:::
