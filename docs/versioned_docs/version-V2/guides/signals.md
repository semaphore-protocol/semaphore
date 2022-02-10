---
sidebar_position: 3
---

# Signals

Describe how to verify proofs and signal arbitrary strings.

## Broadcasting signals

To broadcast a signal, the user must invoke this Semaphore contract function:

```
broadcastSignal(
    bytes memory _signal,
    uint256[8] memory _proof,
    uint256 _root,
    uint256 _nullifiersHash,
    uint232 _externalNullifier
)
```

- `_signal`: the signal to broadcast.
- `_proof`: a zk-SNARK proof (see below).
- `_root`: The root of the identity tree, where the user's identity commitment
  is the last-inserted leaf.
- `_nullifiersHash`: A uniquely derived hash of the external nullifier, user's
  identity nullifier, and the Merkle path index to their identity commitment.
  It ensures that a user cannot broadcast a signal with the same external
  nullifier more than once.
- `_externalNullifier`: The external nullifier at which the signal is
  broadcast.

To zk-SNARK proof must satisfy the constraints created by Semaphore's zk-SNARK
circuit as described below:
