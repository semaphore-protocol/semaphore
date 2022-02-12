---
id: introduction
title: What Is Semaphore?
sidebar_position: 1
---

:::caution
Semaphore's V2 documentation is under development.
:::

## Overview

[Semaphore](https://github.com/appliedzkp/semaphore) is a zero-knowledge gadget
which allows Ethereum users to prove their membership of a set which they had
previously joined without revealing their original identity. At the same time,
it allows users to signal their endorsement of an arbitrary string. It is
designed to be a simple and generic privacy layer for Ethereum DApps. Use cases
include private voting, whistleblowing, mixers, and anonymous authentication.
Finally, it provides a simple built-in mechanism to prevent double-signalling
or double-spending.

This gadget comprises of smart contracts and
[zero-knowledge](https://z.cash/technology/zksnarks/) components which work in
tandem. The Semaphore smart contract handles state, permissions, and proof
verification onchain. The zero-knowledge components work offchain to allow
users to generate proofs, which allow the smart contract to update its state
if these proofs are valid.

Semaphore is designed for DApp developers (not for end-users) and it allows them to abstract their
features in order to provide user-friendly privacy.

## Basic features

In sum, Semaphore provides the ability to:

1. generate offchain identities and add them to a Merke tree (offchain or onchain);
2. anonymously broadcast a signal onchain, if and only if the identity of the owner belongs to a
   valid Merkle tree and if the nullifier has not already been used.

## About the code

The core of the protocol is in the [circuit logic](https://github.com/appliedzkp/semaphore/tree/main/circuits/scheme.png), however
Semaphore also provides [Solidity contracts](https://github.com/appliedzkp/semaphore/tree/main/contracts)
and [JavaScript libraries](https://github.com/appliedzkp/zk-kit) (i.e. `@zk-kit/identity` and `@zk-kit/protocols`) to make
the steps for offchain proof creation and onchain verification simpler.

A code audit and a multi-party computation to produce the zk-SNARK proving and verification keys
for Semaphore will begin in the near future.
