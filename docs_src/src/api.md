# Contract API

## Constructor

**Contract ABI**:

`constructor(uint8 _treeLevels, uint232 _firstExternalNullifier)`

- `_treeLevels`: The depth of the identity tree.
- `_firstExternalNullifier`: The first identity nullifier to add.

The depth of the identity tree determines how many identity commitments may be
added to this contract: `2 ^ _treeLevels`. Once the tree is full, further
insertions will fail with the revert reason `IncrementalMerkleTree: tree is
full`.

The first external nullifier will be added as an external nullifier to the
contract, and this external nullifier will be active once the deployment
completes.

## Identity insertion

**Contract ABI**:

`function insertIdentity(uint256 _identityCommitment)`

- `_identity_commitment`: The user's identity commitment, which is the hash of
  their public key and their identity nullifier (a random 31-byte value). It
  should be the output of a Pedersen hash. It is the responsibility of the
  caller to verify this.

**Off-chain `libsemaphore` helper functions**:

To generate an identity commitment, use the `libsemaphore` functions
`genIdentity()` and `genIdentityCommitment()` Typescript (or Javascript)
functions:


```ts
const identity: Identity = genIdentity()
const identityCommitment = genIdentityCommitment(identity)
```

Be sure to store `identity` somewhere safe. The `serialiseIdentity()` function
can help with this:

`const serialisedId: string = serialiseIdentity(identity: Identity)`

It converts an `Identity` into a JSON string which looks like this:

```text
["e82cc2b8654705e427df423c6300307a873a2e637028fab3163cf95b18bb172e","a02e517dfb3a4184adaa951d02bfe0fe092d1ee34438721d798db75b8db083","15c6540bf7bddb0616984fccda7e954a0fb5ea4679ac686509dc4bd7ba9c3b"]
```

To convert this string back into an `Identity`, use `unSerialiseIdentity()`.

`const id: Identity = unSerialiseIdentity(serialisedId)`
