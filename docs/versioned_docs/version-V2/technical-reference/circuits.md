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

- `identity_nullifier`: a random 32-byte value which the user should save,
- `identity_trapdoor`: a random 32-byte value which the user should save,
- `identity_path_elements`: the values along the Merkle path to the user's identity commitment,
- `identity_path_index[n_levels]`: the direction (left/right) per tree level corresponding to the Merkle path to the user's identity commitment.

**Public outputs:**

- `root`: The Merkle root of the identity tree.

**Procedure:**

The circuit hashes the public key, identity nullifier, and identity trapdoor to
generate an **identity commitment**. It then verifies the Merkle proof against
the Merkle root and the identity commitment.

## 2. Nullifier

**Private inputs:**

- `identity_nullifier`: a random 32-byte value which the user should save,
- `identity_trapdoor`: a random 32-byte value which the user should save,

**Public inputs:**

- `external_nullifier`: the 29-byte external nullifier - see above

**Public outputs:**

- `nullifiers_hash`: the hash of the identity nullifier, external nullifier,
  and Merkle path index (`identity_path_index`)

**Procedure:**

The circuit hashes the given identity nullifier, external nullifier, and Merkle
path index, and checks that it matches the given nullifiers hash. Additionally,
the smart contract ensures that it has not previously seen this nullifiers
hash. This way, double-signalling is impossible.

## 3. Signal

**Public inputs:**

- `signal_hash`: ...

**Procedure:**

The circuit hashes the signal hash and the external nullifier, and verifies
this output against the given public key and signature. This ensures the
authenticity of the signal and prevents front-running attacks.
