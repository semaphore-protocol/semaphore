---
sidebar_position: 1
---

# Circuits

[Semaphore circuits](https://github.com/appliedzkp/semaphore/tree/main/circuits) are the heart of the protocol and essentially allow you to prove:

1. **Merkle tree**: that the identity commitment exists in the Merkle tree,
2. **Nullifiers**: that the signal was only broadcasted once,
3. **Signal**: that the signal was truly broadcasted by the user who generated the proof.

![Semaphore circuit](https://github.com/appliedzkp/semaphore/raw/main/circuits/scheme.png)

## 1. Merkle tree

**Private inputs:**

- `identityNullifier`: a random 32-byte value which the user should save,
- `identityTrapdoor`: a random 32-byte value which the user should save,
- `treeSiblings[nLevels]`: the values along the Merkle path to the user's identity commitment,
- `treePathIndices[nLevels]`: the direction (0/1) per tree level corresponding to the Merkle path to the user's identity commitment.

**Public outputs:**

- `root`: The Merkle root of the identity tree.

**Procedure:**

The circuit hashes the hash of the identity nullifier and the identity trapdoor to
generate an **identity commitment**. It then verifies the Merkle proof against
the Merkle root and the identity commitment.

## 2. Nullifier

**Private inputs:**

- `identityNullifier`: a random 32-byte value which the user should save.

**Public inputs:**

- `externalNullifier`: the 32-byte external nullifier.

**Public outputs:**

- `nullifierHash`: the hash of the identity nullifier and the external nullifier.

**Procedure:**

The circuit hashes the identity nullifier and the external nullifier. The it checks that it matches the given nullifiers hash. Additionally,
the smart contract ensures that it has not previously seen this nullifiers hash. This way, double-signalling is impossible.

## 3. Signal

**Public inputs:**

- `signalHash`: the hash of the user's signal.

**Procedure:**

The circuit performs a dummy square to prevent tampering.
