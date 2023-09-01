<p align="center">
    <h1 align="center">
        Semaphore identity
    </h1>
    <p align="center">A library to create Semaphore identities.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/identity">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/identity?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/identity">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/identity.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/identity">
        <img alt="Documentation typedoc" src="https://img.shields.io/badge/docs-typedoc-744C7C?style=flat-square">
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
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library provides a class that can be used to create identities compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Each identity contains two secret values: _trapdoor_ and _nullifier_, and one public value: _commitment_. The Poseidon hash of the secret values is the identity secret, and its hash is the identity commitment. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

// The identity can be generated randomly.
const identity1 = new Identity()

// Deterministically from a secret message.
const identity2 = new Identity("secret-message")

// Or it can be retrieved from an existing identity.
const identity3 = new Identity(identity1.toString())

// Trapdoor, nullifier and commitment are the attributes (e.g. JS getters).
const { trapdoor, nullifier, commitment } = identity1
```
