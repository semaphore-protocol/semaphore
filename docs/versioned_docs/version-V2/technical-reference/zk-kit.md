---
sidebar_position: 3
---

# ZK-kit libraries

When using Semaphore each user will need to create their own identity, which will then be added to a group. [`@zk-kit/identity`](https://github.com/appliedzkp/zk-kit/tree/main/packages/identity) allows users to create and manage their identities, while [`@zk-kit/protocols`](https://github.com/appliedzkp/zk-kit/tree/main/packages/protocols) allows users to create Semaphore proofs to prove their group membership and signal their endorsement of an arbitrary string anonymously.

If you need to see the interface of these libraries go to http://zkkit.appliedzkp.org.

:::info
[ZK-kit](https://github.com/appliedzkp/zk-kit) is a set of reusable JavaScript libraries for zero-knowledge technologies. It also contains other useful libraries, such as the [Solidity](https://github.com/appliedzkp/zk-kit/tree/main/packages/incremental-merkle-tree.sol) and [JavaScript](https://github.com/appliedzkp/zk-kit/tree/main/packages/incremental-merkle-tree) implementations of the incremental Merkle tree.
:::

## @zk-kit/identity

The Semaphore identity consists primarily of two values: `trapdoor` and `nullifier`. The Poseidon hash of these two values is the `secret`, whose hash in turn is the `identity commitment`, which is used as the leaf of the Merkle tree later.

This library therefore contains a `ZKIdentity` class that can generate these values with 3 different [strategies](http://zkkit.appliedzkp.org/identity/enums/Strategy.html):

- `Strategy.RANDOM`: this is the default option and it generates the values randomly,
- `Strategy.MESSAGE`: it allows values to be generated deterministically from a message using sha256,
- `Strategy.SERIALIZE`: it allows you to retrieve values from a previously serialized identity.

## @zk-kit/protocols
