<p align="center">
    <h1 align="center">
        Semaphore identity
    </h1>
    <p align="center">A library to create Semaphore identities.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol/semaphore.js">
        <img src="https://img.shields.io/badge/project-semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore.js/blob/main/packages/identity/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.js.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/identity">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/identity?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/identity">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/identity.svg?style=flat-square" />
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
        <a href="https://semaphore-protocol.github.io/semaphore.js/identity">
            📘 Docs
        </a>
    </h4>
</div>

| This library provides a class that can be used to create identities compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Each identity contains two private values (_trapdoor_ and _nullifier_), and the Poseidon hash of these values (_commitment_) is used as the public identifier of the Semaphore identity. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/identity` package with npm:

```bash
npm i @semaphore-protocol/identity
```

or yarn:

```bash
yarn add @semaphore-protocol/identity
```

## 📜 Usage

\# **new Identity**(identityOrMessage?: _string_): _Identity_

```typescript
import { Identity } from "@semaphore-protocol/identity"

// Trapdoor and nullifier are generated randomly.
const identity1 = new Identity()

// Trapdoor and nullifier are generated deterministically from a secret message.
const identity2 = new Identity("secret-message")

// Trapdoor and nullifier are generated from an existing identity.
const identity3 = new Identity(identity1.toString())
```

\# **getTrapdoor**(): _bigint_

```typescript
const trapdoor = identity.getTrapdoor()
```

\# **getNullifier**(): _bigint_

```typescript
const nullifier = identity.getNullifier()
```

\# **generateCommitment**(): _bigint_

```typescript
const commitment = identity.generateCommitment()
```
