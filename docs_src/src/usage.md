# Usage

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
Client contract. This allows the Client contract to call owner-only critical
Semaphore functions.

See [SemaphoreClient.sol](./contracts/sol/SemaphoreClient.sol) for an example.

## Inserting identities

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

## Broadcasting signals

First obtain the leaves of the identity tree (in sequence, up to the user's
identity commitment, or more).

```ts
const leaves = <list of leaves>
```

```
const result = await genWitness(
    SIGNAL,
    circuit,
    identity,
    leaves,
    NUM_LEVELS,
    FIRST_EXTERNAL_NULLIFIER,
)

proof = await genProof(result.witness, provingKey)
publicSignals = genPublicSignals(result.witness, circuit)
params = genBroadcastSignalParams(result, proof, publicSignals)
```
