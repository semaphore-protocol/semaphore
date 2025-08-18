---
sidebar_position: 3
title: Proofs
---

# Semaphore proofs

Learn how to use Semaphore to generate and verify zero-knowledge proofs.

Once a user joins their [Semaphore identity](/V2/glossary#semaphore-identity) to a [Semaphore group](/V2/glossary#semaphore-group), the user can signal anonymously with a zero-knowledge proof that proves the following:

-   The user is a member of the group.
-   The same user created the signal and the proof.

Developers can use Semaphore for the following:

-   [**Generate a proof off-chain**](#generate-a-proof-off-chain)
-   [**Verify a proof off-chain**](#verify-a-proof-off-chain)
-   [**Verify a proof on-chain**](#verify-a-proof-on-chain)

## Generate a proof off-chain

Use the [`@semaphore-protocol/proof`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/proof) library to generate an off-chain proof.
To generate a proof, pass the following properties to the `generateProof` function:

-   `identity`: The Semaphore identity of the user broadcasting the signal and generating the proof.
-   `group`: The group to which the user belongs.
-   `externalNullifier`: The value that prevents double-signaling.
-   `signal`: The signal the user wants to send anonymously.
-   `snarkArtifacts`: The `zkey` and `wasm` [trusted setup files](/V2/glossary/#trusted-setup-files).

In the voting system use case, once all the voters have joined their [identities](/V2/guides/identities#create-identities) to the ballot [group](/V2/guides/groups),
a voter can generate a proof to vote for a proposal.
In the call to `generateProof`, the voting system passes the unique ballot ID (the [Merkle tree](/V2/glossary#merkle-tree) root of the group) as the
`externalNullifier` to prevent the voter signaling more than once for the ballot.
The following code sample shows how to use `generateProof` to generate the voting proof:

```ts
import { generateProof } from "@semaphore-protocol/proof"

const externalNullifier = group.root
const signal = "proposal_1"

const fullProof = await generateProof(identity, group, externalNullifier, signal, {
    zkeyFilePath: "./semaphore.zkey",
    wasmFilePath: "./semaphore.wasm"
})
```

## Verify a proof off-chain

Use the [`@semaphore-protocol/proof`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/proof) library to verify a Semaphore proof off-chain.
To verify a proof, pass the following to the `verifyProof` function:

-   _`proof`_: the Semaphore proof.
-   _`verificationKey`_: the JavaScript object in the `semaphore.json` [trusted setup file](/V2/glossary/#trusted-setup-files).

The following code sample shows how to parse the verification key object from `semaphore.json`
and verify the previously generated proof:

```ts
import { verifyProof } from "@semaphore-protocol/proof"

const verificationKey = JSON.parse(fs.readFileSync("./semaphore.json", "utf-8"))

await verifyProof(verificationKey, fullProof) // true or false.
```

`verifyProof` returns a Promise that resolves to `true` or `false`.

## Verify a proof on-chain

Use the [`SemaphoreCore`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/base/SemaphoreCore.sol) contract to verify proofs on-chain. It uses a verifier deployed to Ethereum and provides methods hash the signal and verify a proof.

:::info
You can import `SemaphoreCore` and other Semaphore contracts from the [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts) NPM module.
:::

To verify Semaphore proofs in your contract, import `SemaphoreCore` and pass the following to the `_verifyProof` internal method:

-   _`signal`_: The Semaphore signal to prove.
-   _`root`_: The root of the Merkle tree.
-   _`nullifierHash`_: a [nullifier hash](#retrieve-a-nullifier-hash).
-   _`externalNullifier`_: The external nullifier.
-   _`proof`_: A [_Solidity-compatible_ Semaphore proof](#generate-a-solidity-compatible-proof).
-   _`verifier`_: The verifier address.

Remember to save the `nullifierHash` on-chain to avoid double-signaling.

Alternatively, you can use an already deployed [`Semaphore`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/Semaphore.sol) contract and use its `verifyProof` external function.

### Generate a Solidity-compatible proof

To transform a proof to be compatible with Solidity contracts, pass the proof to the `packToSolidityProof` utility function--for example:

```ts
import { packToSolidityProof } from "@semaphore-protocol/proof"

const solidityProof = packToSolidityProof(fullProof.proof)
```

Semaphore returns a new Solidity-compatible instance of the proof.

### Retrieve a nullifier hash

To get the Semaphore proof nullifier hash, access the proof's `publicSignals.nullifierHash` property--for example:

```ts
const { nullifierHash } = fullProof.publicSignals
```
