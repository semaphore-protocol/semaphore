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
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fproof?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/proof">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/proof?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/proof">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/proof.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_proof">
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
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library provides utility functions to generate and verify Semaphore proofs compatible with the Semaphore [circuits](https://github.com/semaphore-protocol/semaphore/tree/main/circuits). Generating valid zero-knowledge proofs requires files that can only be obtained in an attested trusted-setup ceremony. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

For more information on the functions provided by `@semaphore-protocol/proof`, please refer to the [TypeDoc documentation](https://js.semaphore.pse.dev/modules/_semaphore_protocol_proof).

\# **generateProof**(
identity: _Identity_,
group: _Group_,
message: _BigNumberish_ | _Uint8Array_ | string,
scope: _BigNumberish_ | _Uint8Array_ | string,
merkleTreeDepth: _number_,
snarkArtifacts?: [_SnarkArtifacts_](https://github.com/privacy-scaling-explorations/zk-kit/blob/88acdc6d8fa5f3f2a8ecd1e1a0140244b970c551/packages/utils/src/types/index.ts#L46)
): Promise\<_SemaphoreProof_>

```typescript
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

const identity1 = new Identity()
const identity2 = new Identity()
const identity3 = new Identity()

const group = new Group([identity1.commitment, identity2.commitment, identity3.commitment])

const message = "Hello world"
const scope = "Semaphore"

// snarkArtifacts are not provided.
// So they will be automatically downloaded (see https://github.com/privacy-scaling-explorations/snark-artifacts).
const proof1 = await generateProof(identity1, group, message, scope)

// You can also specify the maximum tree depth supported by the proof.
const proof2 = await generateProof(identity2, group, message, scope, 20)

// You can also override our default zkey/wasm files.
const proof3 = await generateProof(identity3, group, message, scope, 20, {
    wasm: "./semaphore.wasm",
    zkey: "./semaphore.zkey"
})
```

\# **verifyProof**(semaphoreProof: _SemaphoreProof_): Promise\<_boolean_>

```typescript
import { verifyProof } from "@semaphore-protocol/proof"

await verifyProof(proof1)
```

## Resource management: Terminating the bn128 curve

When using the Semaphore proof library in Node.js environments, especially in tests or scripts that create and use the `bn128` curve (for example, via `getCurveFromName("bn128")` from the `ffjavascript` package), it is important to properly release resources associated with the curve after use. Failing to do so can result in leaked handles (such as `MessagePort` handles), which may prevent Node.js from exiting cleanly. This is particularly relevant when running test suites.

**How to terminate the bn128 curve:**

If you create a curve instance using `getCurveFromName("bn128")`, you should call its `terminate()` method when you are done with it. For example:

```typescript
import { getCurveFromName } from "ffjavascript"

let curve
beforeAll(async () => {
    curve = await getCurveFromName("bn128")
})
afterAll(async () => {
    await curve.terminate()
})
```

This ensures that all resources are properly released and Node.js can exit cleanly after your script or tests finish.
