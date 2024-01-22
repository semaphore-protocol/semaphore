<p align="center">
    <h1 align="center">
        Semaphore proof
    </h1>
    <p align="center">A library to generate and verify Semaphore proofs.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/proof">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/proof?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/proof">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/proof.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/proof">
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

| This library provides utility functions to generate and verify Semaphore proofs compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Generating valid zero-knowledge proofs requires files that can only be obtained in an attested [trusted-setup ceremony](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore_top_index.html). For a complete list of ready-to-use files visit [trusted-setup-pse.org](http://www.trusted-setup-pse.org/). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/proof` package and its peer dependencies with npm:

```bash
npm i @semaphore-protocol/identity @semaphore-protocol/group @semaphore-protocol/proof
```

or yarn:

```bash
yarn add @semaphore-protocol/identity @semaphore-protocol/group @semaphore-protocol/proof
```

## 📜 Usage

\# **generateProof**(
identity: _Identity_,
group: _Group_,
message: _BytesLike | Hexable | number | bigint_,
scope: _BytesLike | Hexable | number | bigint_,
merkleTreeDepth: _number_,
snarkArtifacts?: _SnarkArtifacts_
): Promise\<_SemaphoreProof_>

```typescript
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { utils } from "ethers"

const identity = new Identity()
const group = new Group()

const scope = utils.formatBytes32String("Topic")
const message = utils.formatBytes32String("Hello world")

group.addMembers([...identityCommitments, identity.generateCommitment()])

const fullProof1 = await generateProof(identity, group, message, scope)

// You can also specify the maximum tree depth supported by the proof.
const fullProof2 = await generateProof(identity, group, message, scope, 20)

// You can also specify the default zkey/wasm files.
const fullProof3 = await generateProof(identity, group, message, scope, 20, {
    wasmFilePath: "./semaphore.wasm",
    zkeyFilePath: "./semaphore.zkey"
})
```

\# **verifyProof**(semaphoreProof: _SemaphoreProof_): Promise\<_boolean_>

```typescript
import { verifyProof } from "@semaphore-protocol/proof"

await verifyProof(fullProof)
```
