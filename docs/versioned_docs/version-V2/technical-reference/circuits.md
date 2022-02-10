---
sidebar_position: 1
---

# Circuits

The
[semaphore-base.circom](https://github.com/appliedzkp/semaphore/blob/master/circuits/circom/semaphore-base.circom)
circuit helps to prove the following:

### That the identity commitment exists in the Merkle tree

**Private inputs:**

- `identity_pk`: the user's EdDSA public key
- `identity_nullifier`: a random 32-byte value which the user should save
- `identity_trapdoor`: a random 32-byte value which the user should save
- `identity_path_elements`: the values along the Merkle path to the
  user's identity commitment
- `identity_path_index[n_levels]`: the direction (left/right) per tree level
  corresponding to the Merkle path to the user's identity commitment

**Public inputs:**

- `root`: The Merkle root of the identity tree

**Procedure:**

The circuit hashes the public key, identity nullifier, and identity trapdoor to
generate an **identity commitment**. It then verifies the Merkle proof against
the Merkle root and the identity commitment.

### That the signal was only broadcasted once

**Private inputs:**

- `identity_nullifier`: as above
- `identity_path_index`: as above

**Public inputs:**

- `external_nullifier`: the 29-byte external nullifier - see above
- `nullifiers_hash`: the hash of the identity nullifier, external nullifier,
  and Merkle path index (`identity_path_index`)

**Procedure:**

The circuit hashes the given identity nullifier, external nullifier, and Merkle
path index, and checks that it matches the given nullifiers hash. Additionally,
the smart contract ensures that it has not previously seen this nullifiers
hash. This way, double-signalling is impossible.

### That the signal was truly broadcasted by the user who generated the proof

**Private inputs:**

- `identity_pk`: as above
- `auth_sig_r`: the `r` value of the signature of the signal
- `auth_sig_s`: the `s` value of the signature of the signal

**Public inputs:**

- `signal_hash`: the hash of the signal
- `external_nullifier`: the 29-byte external nullifier - see above

**Procedure:**

The circuit hashes the signal hash and the external nullifier, and verifies
this output against the given public key and signature. This ensures the
authenticity of the signal and prevents front-running attacks.

## Cryptographic primitives

Semaphore uses MiMC for the Merkle tree, Pedersen commmitments for the identity
commitments, Blake2 for the nullifiers hash, and EdDSA for the signature.

MiMC is a relatively new hash function. We use the recommended MiMC
construction from [Albrecht et al](https://eprint.iacr.org/2016/492.pdf), and
there is a prize to break MiMC at [http://mimchash.org](http://mimchash.org)
which has not been claimed yet.

We have also implemented a version of Semaphore which uses the Poseidon hash
function for the Merkle tree and EdDSA signature verification. This may have
better security than MiMC, allows identity insertions to save about 20% gas,
and roughly halves the proving time. Note, however, that the Poseidon-related
circuits and EVM bytecode generator have not been audited, so use it with
caution. To use it, checkout the `feat/poseidon` branch of this repository.
