<p align="center">
    <h1 align="center">
        Semaphore proof
    </h1>
    <p align="center">A library to generate and verify Semaphore proofs.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol/semaphore.js">
        <img src="https://img.shields.io/badge/project-semaphore.js-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore.js/blob/main/packages/proof/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.js.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/proof">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/proof?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/proof">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/proof.svg?style=flat-square" />
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://t.me/joinchat/B-PQx1U3GtAh--Z4Fwo56A">
            🗣️ Chat &amp; Support
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore-protocol.github.io/semaphore.js/proof">
            📘 Docs
        </a>
    </h4>
</div>

| This library provides utility functions to generate and verify Semaphore proofs compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Generating valid zero-knowledge proofs requires files that can only be obtained in an attested [trusted-setup ceremony](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore_top_index.html). For a complete list of ready-to-use files visit [trusted-setup-pse.org](http://www.trusted-setup-pse.org/). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/proof` package with npm:

```bash
npm i @semaphore-protocol/proof
```

or yarn:

```bash
yarn add @semaphore-protocol/proof
```

## 📜 Usage

\# **generateProof**(identity: _Identity_, group: _Group_, externalNullifier: _BigNumberish_, signal: _string_, snarkArtifacts?: _SnarkArtifacts_): Promise\<_SemaphoreFullProof_>

```typescript
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

const identity = new Identity()
const group = new Group()
const externalNullifier = BigInt(1)
const signal = "Hello world"

group.addMembers([...identityCommitments, identity.generateCommitment()])

const fullProof = await generateProof(
    identity,
    merkleProof,
    externalNullifier,
    signal,
    {
        zkeyFilePath: "./semaphore.zkey",
        wasmFilePath: "./semaphore.wasm"
    }
)

// You can also use the default zkey/wasm files (only for browsers!).
// const fullProof = await generateProof(identity, merkleProof, externalNullifier, signal)
```

\# **verifyProof**(verificationKey: _any_, fullProof: _FullProof_): Promise\<_boolean_>

```typescript
import { verifyProof } from "@semaphore-protocol/proof"

const verificationKey = JSON.parse(fs.readFileSync("/semaphore.json", "utf-8"))

await verifyProof(verificationKey, fullProof)
```

\# **packToSolidityProof**(proof: _Proof_): _SolidityProof_

```typescript
import { packToSolidityProof } from "@semaphore-protocol/proof"

const solidityProof = packToSolidityProof(fullProof.proof)
```

\# **generateNullifierHash**(externalNullifier: _BigNumberish_, identityNullifier: _BigNumberish_): _bigint_

```typescript
import { generateNullifierHash } from "@semaphore-protocol/proof"

const nullifierHash = generateNullifierHash(
    externalNullifier,
    identity.getNullifier()
)
```

\# **generateSignalHash**(signal: _string_): _bigint_

```typescript
import { generateSignalHash } from "@semaphore-protocol/proof"

const signalHash = generateSignalHash(signal)
```
