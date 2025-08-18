---
sidebar_position: 6
---

# libsemaphore

[`libsemaphore`](https://www.npmjs.com/package/libsemaphore) is a helper
library for Semaphore written in Typescript. Any dApp written in Javascript or
Typescript should use it as it provides useful abstractions over common tasks
and objects, such as identities and proof generation.

Note that only v1.0.14 and above works with the Semaphore code in this
repository. v0.0.x is compatible with the pre-audited Semaphore code.

## Available types, interfaces, and functions

### Types

**`SnarkBigInt`**

A big integer type compatible with the `snarkjs` library. Note that it is not
advisable to mix variables of this type with `bigNumber`s or `BigInt`s.
Encapsulates `snarkjs.bigInt`.

**`EddsaPrivateKey`**

An [EdDSA](https://tools.ietf.org/html/rfc8032) private key which should be 32
bytes long. Encapsulates a [`Buffer`](https://nodejs.org/api/buffer.html).

**`EddsaPublicKey`**

An EdDSA public key. Encapsulates an array of `SnarkBigInt`s.

**`SnarkProvingKey`**

A proving key, which when used with a secret _witness_, generates a zk-SNARK
proof about said witness. Encapsulates a `Buffer`.

**`SnarkVerifyingKey`**

A verifying key which when used with public inputs to a zk-SNARK and a
`SnarkProof`, can prove the proof's validity. Encapsulates a `Buffer`.

**`SnarkWitness`**

The secret inputs to a zk-SNARK. Encapsulates an array of `SnarkBigInt`s.

**`SnarkPublicSignals`**

The public inputs to a zk-SNARK. Encapsulates an array of `SnarkBigInt`s.

### Interfaces

**`EddsaKeyPair`**

Encapsulates an `EddsaPublicKey` and an `EddsaPrivateKey`.

```ts
interface EddsaKeyPair {
    pubKey: EddsaPublicKey
    privKey: EddsaPrivateKey
}
```

**`Identity`**

Encapsulates all information required to generate an identity commitment, and
is crucial to creating `SnarkProof`s to broadcast signals.

```ts
interface Identity {
    keypair: EddsaKeyPair
    identityNullifier: SnarkBigInt
    identityTrapdoor: SnarkBigInt
}
```

**`SnarkProof`**

Note that `broadcastSignal()` accepts a `uint256[8]` array for its `_proof`
parameter. See `genBroadcastSignalParams()`.

```ts
interface SnarkProof {
    pi_a: SnarkBigInt[]
    pi_b: SnarkBigInt[][]
    pi_c: SnarkBigInt[]
}
```

### Functions

**`genPubKey(privKey: EddsaPrivateKey): EddsaPublicKey`**

Generates a public EdDSA key from a supplied private key. To generate a private
key, use `crypto.randomBytes(32)` where `crypto` is the built-in Node or
browser module.

**`genIdentity(): Identity`**

This is a convenience function to generate a fresh and random `Identity`. That
is, the 32-byte private key for the `EddsaKeyPair` is randomly generated, as
are the distinct 31-byte identity nullifier and the 31-byte identity trapdoor
values.

**`serialiseIdentity(identity: Identity): string`**

Converts an `Identity` into a JSON string which looks like this:

```text
["e82cc2b8654705e427df423c6300307a873a2e637028fab3163cf95b18bb172e","a02e517dfb3a4184adaa951d02bfe0fe092d1ee34438721d798db75b8db083","15c6540bf7bddb0616984fccda7e954a0fb5ea4679ac686509dc4bd7ba9c3b"]
```

You can also spell this function as `serializeIdentity`.

To convert this string back into an `Identity`, use `unSerialiseIdentity()`.

**`unSerialiseIdentity(string: serialisedId): Identity`**

Converts the `string` output of `serialiseIdentity()` to an `Identity`.

You can also spell this function as `unSerializeIdentity`.

**`genIdentityCommitment(identity: Identity): SnarkBigInt`**

Generates an identity commitment, which is the hash of the public key, the
identity nullifier, and the identity trapdoor.

**`async genProof(witness: SnarkWitness, provingKey: SnarkProvingKey): SnarkProof`**

Generates a `SnarkProof`, which can be sent to the Semaphore contract's
`broadcastSignal()` function. It can also be verified off-chain using
`verifyProof()` below.

**`genPublicSignals(witness: SnarkWitness, circuit: SnarkCircuit): SnarkPublicSignals`**

Extracts the public signals to be supplied to the contract or `verifyProof()`.

**`verifyProof(verifyingKey: SnarkVerifyingKey, proof: SnarkProof, publicSignals: SnarkPublicSignals): boolean`**

Returns `true` if the given `proof` is valid, given the correct verifying key
and public signals.

Returns `false` otherwise.

**`signMsg(privKey: EddsaPrivateKey, msg: SnarkBigInt): EdDSAMiMcSpongeSignature)`**

Encapsulates `circomlib.eddsa.signMiMCSponge` to sign a message `msg` using private key `privKey`.

**`verifySignature(msg: SnarkBigInt, signature: EdDSAMiMcSpongeSignature, pubKey: EddsaPublicKey)`: boolean**

Returns `true` if the cryptographic `signature` of the signed `msg` is from the
private key associated with `pubKey`.

Returns `false` otherwise.

**`setupTree(levels: number, prefix: string): MerkleTree`**

Returns a Merkle tree created using
[`semaphore-merkle-tree`](https://www.npmjs.com/package/semaphore-merkle-tree)
with the same number of levels which the Semaphore zk-SNARK circuit expects.
This tree is also configured to use `MimcSpongeHasher`, which is also what the
circuit expects.

`levels` sets the number of levels of the tree. A tree with 20 levels, for
instance, supports up to 1048576 deposits.

**`genCircuit(circuitDefinition: any)`**

Returns a `new snarkjs.Circuit(circuitDefinition)`. The `circuitDefinition`
object should be the `JSON.parse`d result of the `circom` command which
converts a `.circom` file to a `.json` file.

**`async genWitness(...)`**

This function has the following signature:

```ts
const genWitness = async (
    signal: string,
    circuit: SnarkCircuit,
    identity: Identity,
    idCommitments: SnarkBigInt[] | BigInt[] | ethers.utils.BigNumber[],
    treeDepth: number,
    externalNullifier: SnarkBigInt,
)
```

-   `signal` is the string you wish to broadcast.
-   `circuit` is the output of `genCircuit()`.
-   `identity` is the `Identity` whose identity commitment you want to prove is
    in the set of registered identities.
-   `idCommitments` is an array of registered identity commitments; i.e. the
    leaves of the tree.
-   `treeDepth` is the number of levels which the Merkle tree used has
-   `externalNullifier` is the current external nullifier

It returns an object as such:

-   `witness`: The witness to pass to `genProof()`.
-   `signal`: The computed signal for Semaphore. This is the hash of the
    recipient's address, relayer's address, and fee.
-   `signalHash`: The hash of the computed signal.
-   `msg`: The hash of the external nullifier and the signal hash
-   `signature`: The signature on the above msg.
-   `tree`: The Merkle tree object after it has been updated with the identity commitment
-   `identityPath`: The Merkle path to the identity commitment
-   `identityPathIndex`: The leaf index of the identity commitment
-   `identityPathElements`: The elements along the above Merkle path

Only `witness` is essential to generate the proof; the other data is only
useful for debugging and additional off-chain checks, such as verifying the
signature and the Merkle tree root.

**`formatForVerifierContract = (proof: SnarkProof, publicSignals: SnarkPublicSignals`**

Converts the data in `proof` and `publicSignals` to strings and rearranges
elements of `proof.pi_b` so that `snarkjs`'s `verifier.sol` will accept it.
To be specific, it returns an object as such:

```ts
{
    a: [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
    b: [
         [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ],
         [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ],
    ],
    c: [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
    input: publicSignals.map((x) => x.toString()),
}
```

**`stringifyBigInts = (obj: any) => object`**

Encapsulates `snarkjs.stringifyBigInts()`. Makes it easy to convert `SnarkProof`s to JSON.

**`unstringifyBigInts = (obj: any) => object`**

Encapsulates `snarkjs.unstringifyBigInts()`. Makes it easy to convert JSON to `SnarkProof`s.

**`genExternalNullifier = (plaintext: string) => string`**

Each external nullifier must be at most 29 bytes large. This function
keccak-256-hashes a given `plaintext`, takes the last 29 bytes, and pads it
(from the start) with 0s, and returns the resulting hex string.
