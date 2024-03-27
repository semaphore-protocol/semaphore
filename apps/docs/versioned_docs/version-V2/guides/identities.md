---
sidebar_position: 1
title: Identities
---

# Semaphore identities

In order to join a [Semaphore group](/V2/glossary#semaphore-group), a user must first create a [Semaphore identity](/V2/glossary#semaphore-identity).
A Semaphore identity contains two values generated with the identity:

-   Identity trapdoor
-   identity nullifier

To use and verify the identity, the identity owner (user) must know the trapdoor and nullifier values.
To prevent fraud, the owner should keep both values secret.

## Create identities

In your code, use the [`@semaphore-protocol/identity`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/identity) library to create a Semaphore identity _deterministically_ (from the hash of a message) or _randomly_.

-   [**Create random identities**](#create-random-identities)
-   [**Create deterministic identities**](#create-deterministic-identities)

### Create random identities

To create a random identity, instantiate `Identity` without any parameters--for example:

```ts
import { Identity } from "@semaphore-protocol/identity"

const { trapdoor, nullifier, commitment } = new Identity()
```

The new identity contains two random secret values: `trapdoor` and `nullifier`, and one public value: `commitment`.

The Poseidon hash of the identity nullifier and trapdoor is called the _identity secret_,
and its hash is the _identity commitment_.

An identity commitment, similarly to Ethereum addresses, is a public value used
in Semaphore groups to represent the identity of a group member. The secret values are similar to
Ethereum private keys and are used to generate Semaphore zero-knowledge proofs and authenticate signals.

### Create deterministic identities

If you pass a message as a parameter, Semaphore generates `trapdoor` and `nullifier`
from the _SHA256_ hash of the message.
The message might be a password or a message that the user cryptographically signs with a private key.

When using deterministic identities, you should always keep the message secret.
Given that the hash is deterministic, anyone with the same message can recreate the same identity.

```ts
const identity = new Identity("secret-message")
```

:::tip
Building a system to save or recover secret values of Semaphore identities is nontrivial.
You may choose to delegate such functionality to existing wallets such as Metamask--for example:

1. In Metamask, a user signs a message with the private key of their Ethereum account.
2. In your application, the user creates a deterministic identity with the signed message.
3. The user can now recreate their Semaphore identity whenever they want by signing the same message with their Ethereum account in Metamask.

:::

## Save your identities

You can output an identity as a JSON string that you can save and reuse later.
The `Identity.toString()` method generates a JSON array from an identity--for example:

```ts
console.log(identity.toString()) // View the identity trapdoor and nullifier.

// '["8255d...", "62c41..."]'
```

The array contains the trapdoor and nullifier.

To reuse the saved identity, pass the JSON to the `Identity()` constructor.

```ts
const identity2 = new Identity(identity.toString())
```
