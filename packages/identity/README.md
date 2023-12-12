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

| This library provides a class that can be used to create identities compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Each identity contains an EdDSA private key, its public key, and the identity commitment, which is the Poseidon hash of the public key. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

\# **new Identity**(privateKey?: _BigNumberish_): _Identity_

```typescript
import { Identity } from "@semaphore-protocol/identity"

// The identity will be generated randomly.
const { privateKey, publicKey, commitment } = new Identity()

// Alternatively, you can pass your private key.
const identity = new Identity("your-private-key")
```

\# **identity.signMessage**(message: _BigNumberish_): _Signature\<string>_

```typescript
import { Identity } from "@semaphore-protocol/identity"

const message = "message"
const identity = new Identity()

const signature = identity.signMessage(message)
```

\# **identity.verifySignature**(message: _BigNumberish_, signature: _Signature_): _boolean_

```typescript
import { Identity } from "@semaphore-protocol/identity"

const message = "message"
const identity = new Identity()

const signature = identity.signMessage(message)

identity.verifySignature(message, signature)
```

\# **Identity.verifySignature**(message: _BigNumberish_, signature: _Signature_, publicKey: _Point_): _boolean_

```typescript
import { Identity } from "@semaphore-protocol/identity"

const message = "message"
const identity = new Identity()

const signature = identity.signMessage("message", signature)

Identity.verifySignature(message, signature, identity.publicKey)
```
