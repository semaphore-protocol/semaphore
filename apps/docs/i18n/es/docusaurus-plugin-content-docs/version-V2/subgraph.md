---
sidebar_position: 6
---

# Subgraph

[The Graph](https://thegraph.com/) is a protocol for indexing networks like Ethereum and IPFS.
Site owners publish _subgraphs_ that expose site data for anyone to query.
Semaphore's subgraph allows you to retrieve data from the [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/Semaphore.sol) smart contract.

:::tip
The Graph protocol uses the [GraphQL](https://graphql.org/) query language. For examples, see the [GraphQL API documentation](https://thegraph.com/docs/developer/graphql-api). Visit the [subgraph repository](https://github.com/semaphore-protocol/subgraph) to see the list of Semaphore subgraphs.
:::

## Schema

### MerkleTree

-   `id`: unique identifier among all MerkleTree entities,
-   `depth`: Merkle tree depth,
-   `root`: Merkle tree root,
-   `zeroValue`: Merkle tree zero value,
-   `numberOfLeaves`: total number of tree leaves,
-   `group`: link to the Group entity.

### Group

-   `id`: unique identifier among all Group entities,
-   `merkleTree`: link to the MerkleTree entity,
-   `timestamp`: block timestamp,
-   `admin`: admin of the group,
-   `members`: list of group members.
-   `verifiedProofs`: list of group proofs.

### Member

-   `id`: unique identifier among all Member entities,
-   `identityCommitment`: Semaphore identity commitment,
-   `timestamp`: block timestamp,
-   `index`: index of the tree leaf,
-   `group`: link to the Group entity.

### VerifiedProof

-   `id`: unique identifier among all VerifiedProof entities,
-   `signal`: user's signal,
-   `merkleTreeRoot`: Merkle tree root,
-   `nullifierHash`: nullifier hash,
-   `externalNullifier`: external nullifier,
-   `timestamp`: block timestamp,
-   `group`: link to the Group entity.
