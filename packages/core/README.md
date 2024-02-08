<p align="center">
    <h1 align="center">
        Semaphore core
    </h1>
    <p align="center">Core library for the essential Semaphore features.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fcore?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/core">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/core?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/core">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/core.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/core">
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

| This library is a simple re-export of the Semaphore core libraries: `@semaphore-protocol/identity`, `@semaphore-protocol/group`, `@semaphore-protocol/proof`. So that developers can install a single package to use all the core functionalities of the protocol. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/core` package with npm:

```bash
npm i @semaphore-protocol/core
```

or yarn:

```bash
yarn add @semaphore-protocol/core
```

## 📜 Usage

```typescript
import { Identity, Group, generateProof, verifyProof } from "@semaphore-protocol/core"

const identity1 = new Identity()
const identity2 = new Identity()
const identity3 = new Identity()

const group = new Group([identity1.commitment, identity2.commitment, identity3.commitment])

const message = "Hello world"
const scope = "Semaphore"

const proof = await generateProof(identity1, group, message, scope)

await verifyProof(proof)
```
