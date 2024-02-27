---
sidebar_position: 2
---

# Circuits

The [Semaphore circuit](https://github.com/semaphore-protocol/semaphore/tree/main/packages/circuits/semaphore.circom) is the heart of the protocol and consists of three parts:

-   [Proof of membership](#proof-of-membership)
-   [Nullifier](#nullifier)
-   [Message](#message)

![Semaphore circuit](https://github.com/semaphore-protocol/semaphore/raw/main/packages/circuits/scheme.png)

The diagram above shows how the input signals are used in the Semaphore circuit and how the outputs are calculated.

## Proof of membership

The circuit derive the public key from the secret and hashes the public key to generate an identity commitment. Then, it verifies the proof of membership against the Merkle root and the identity commitment.

**Private inputs:**

-   `merkleProofLength`: the actual number of nodes in the Merkle proof path,
-   `merkleProofIndices[MAX_DEPTH]`: the list of 0s and 1s to calculate the hashes of the nodes at the correct position,
-   `merkleProofSiblings[MAX_DEPTH]`: the list of siblings nodes to be used to calculate the hashes of the nodes up to the root,
-   `secret`: the EdDSA [secret scalar](https://www.rfc-editor.org/rfc/rfc8032#section-5.1.5) derived from the private key.

**Public outputs:**

-   `merkleRoot`: The Merkle root of the tree.

## Nullifier

The circuit hashes the secret with the scope and then checks that the result matches the provided nullifier.

**Private inputs:**

-   `secret`: the EdDSA [secret scalar](https://www.rfc-editor.org/rfc/rfc8032#section-5.1.5) derived from the private key.

**Public inputs:**

-   `scope`: the value used like a topic on which users can generate a valid proof only once.

**Public outputs:**

-   `nullifier`: the value designed to be a unique identifier and used to prevent the same proof from being used twice.

## Message

The circuit calculates a dummy square of the message to prevent any tampering with the proof.

**Public inputs:**

-   `message`: the anonymous value the user broadcasts.
