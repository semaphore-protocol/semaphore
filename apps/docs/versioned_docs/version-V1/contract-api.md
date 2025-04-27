---
sidebar_position: 5
---

# Contract API

## Constructor

**Contract ABI**:

`constructor(uint8 _treeLevels, uint232 _firstExternalNullifier)`

-   `_treeLevels`: The depth of the identity tree.
-   `_firstExternalNullifier`: The first identity nullifier to add.

The depth of the identity tree determines how many identity commitments may be
added to this contract: `2 ^ _treeLevels`. Once the tree is full, further
insertions will fail with the revert reason `IncrementalMerkleTree: tree is full`.

The first external nullifier will be added as an external nullifier to the
contract, and this external nullifier will be active once the deployment
completes.

## Add, deactivate, or reactivate external nullifiers

**Contract ABI**:

`addExternalNullifier(uint232 _externalNullifier)`

Adds an external nullifier to the contract. Only the owner can do this.
This external nullifier is active once it is added.

-   `_externalNullifier`: The new external nullifier to set.

`deactivateExternalNullifier(uint232 _externalNullifier)`

-   `_externalNullifier`: The existing external nullifier to deactivate.

Deactivate an external nullifier. The external nullifier must already be active
for this function to work. Only the owner can do this.

`reactivateExternalNullifier(uint232 _externalNullifier)`

Reactivate an external nullifier. The external nullifier must already be
inactive for this function to work. Only the owner can do this.

-   `_externalNullifier`: The deactivated external nullifier to reactivate.

## Insert identities

**Contract ABI**:

`function insertIdentity(uint256 _identityCommitment)`

-   `_identity_commitment`: The user's identity commitment, which is the hash of
    their public key and their identity nullifier (a random 31-byte value). It
    should be the output of a Pedersen hash. It is the responsibility of the
    caller to verify this.

**Off-chain `libsemaphore` helper functions**:

Use `genIdentity()` to generate an `Identity` object, and
`genIdentityCommitment(identity: Identity)` to generate the
`_identityCommitment` value to pass to the contract.

To convert `identity` to a string and back, so that you can store it in a
database or somewhere safe, use `serialiseIdentity()` and
`unSerialiseIdentity()`.

See the [Usage section on inserting
identities](./usage.md#insert-identities) for more information.

## Broadcast signals

**Contract ABI**:

```
broadcastSignal(
    bytes memory _signal,
    uint256[8] memory _proof,
    uint256 _root,
    uint256 _nullifiersHash,
    uint232 _externalNullifier
)
```

-   `_signal`: the signal to broadcast.
-   `_proof`: a zk-SNARK proof (see below).
-   `_root`: The root of the identity tree, where the user's identity commitment
    is the last-inserted leaf.
-   `_nullifiersHash`: A uniquely derived hash of the external nullifier, user's
    identity nullifier, and the Merkle path index to their identity commitment.
    It ensures that a user cannot broadcast a signal with the same external
    nullifier more than once.
-   `_externalNullifier`: The external nullifier at which the signal is
    broadcast.

**Off-chain `libsemaphore` helper functions**:

Use `libsemaphore`'s `genWitness()`, `genProof()`, `genPublicSignals()` and
finally `genBroadcastSignalParams()` to generate the parameters to the
contract's `broadcastSignal()` function.

See the [Usage section on broadcasting
signals](./usage.md#broadcast-signals) for more information.
