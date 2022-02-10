---
sidebar_position: 2
---

# Quick setup

The Semaphore contract forms a base layer for other contracts to create
applications that rely on anonymous signaling.

First, you should ensure that the proving key, verification key, and circuit
file, which are static, be easily available to your users. These may be hosted
in a CDN or bundled with your application code.

The Semaphore team has not performed a trusted setup yet, so trustworthy
versions of these files are not available yet.

Untrusted versions of these files, however, may be obtained via the
`circuits/scripts/download_snarks.sh` script.

Next, to have full flexibility over Semaphore's mechanisms, write a Client
contract and set the owner of the Semaphore contract as the address of the
Client contract. You may also write a Client contract which deploys a Semaphore
contract in its constructor, or on the fly.

With the Client contract as the owner of the Semaphore contract, the Client
contract may call owner-only Semaphore functions such as
`addExternalNullifier()`.

## Add, deactivate, or reactivate external nullifiiers

These functions add, deactivate, and reactivate an external nullifier respectively.
As each identity can only signal once to an external nullifier, and as a signal
can only be successfully broadcasted to an active external nullifier, these
functions enable use cases where it is necessary to have multiple external
nullifiers or to activate and/or deactivate them.

Refer to the [high-level explanation of
Semaphore](https://medium.com/coinmonks/to-mixers-and-beyond-presenting-semaphore-a-privacy-gadget-built-on-ethereum-4c8b00857c9b)
for more details.

## Set broadcast permissioning

Note that `Semaphore.broadcastSignal()` is permissioned by default, so if you
wish for anyone to be able to broadcast a signal, the owner of the Semaphore
contract (either a Client contract or externally owned account) must first
invoke `setPermissioning(false)`.

See [SemaphoreClient.sol](https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/SemaphoreClient.sol) for an example.

## Insert identities

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

## Broadcast signals

First obtain the leaves of the identity tree (in sequence, up to the user's
identity commitment, or more).

```ts
const leaves = <list of leaves>
```

Next, load the circuit from disk (or from a remote source):

```ts
const circuitPath = path.join(__dirname, "/path/to/circuit.json")
const cirDef = JSON.parse(fs.readFileSync(circuitPath).toString())
const circuit = genCircuit(cirDef)
```

Next, use `libsemaphore`'s `genWitness()` helper function as such:

```
const result = await genWitness(
    signal,
    circuit,
    identity,
    leaves,
    num_levels,
    external_nullifier,
)
```

- `signal`: a string which is the signal to broadcast.
- `circuit`: the output of `genCircuit()` (see above).
- `identity`: the user's identity as an `Identity` object.
- `leaves` the list of leaves in the tree (see above).
- `num_levels`: the depth of the Merkle tree.
- `external_nullifier`: the external nullifier at which to broadcast.

Load the proving key from disk (or from a remote source):

```ts
const provingKeyPath = path.join(__dirname, "/path/to/proving_key.bin")
const provingKey: SnarkProvingKey = fs.readFileSync(provingKeyPath)
```

Generate the proof (this takes about 30-45 seconds on a modern laptop):

```ts
const proof = await genProof(result.witness, provingKey)
```

Generate the `broadcastSignal()` parameters:

```ts
const publicSignals = genPublicSignals(result.witness, circuit)
const params = genBroadcastSignalParams(result, proof, publicSignals)
```

Finally, invoke `broadcastSignal()` with the parameters:

```ts
const tx = await semaphoreClientContract.broadcastSignal(
  ethers.utils.toUtf8Bytes(signal),
  params.proof,
  params.root,
  params.nullifiersHash,
  external_nullifier,
  { gasLimit: 500000 }
)
```
