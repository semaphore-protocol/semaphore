<p align="center">
    <h1 align="center">
        HeyAuthn
    </h1>
    <p align="center">A library to allow developers to create and manage Semaphore identities using WebAuthn.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/heyauthn">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/heyauthn?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/heyauthn">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/heyauthn.svg?style=flat-square" />
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
        <a href="https://semaphore.appliedzkp.org/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library allows developers to create and manage Semaphore identities using [WebAuthn](https://webauthn.io/) as a cross-device biometric authentication in a way that is more convenient, smoother and secure than localStorage, Chrome extensions, or password manager based solutions. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/heyauthn` package with npm:

```bash
npm i @semaphore-protocol/heyauthn
```

or yarn:

```bash
yarn add @semaphore-protocol/heyauthn
```

## 📜 Usage

```typescript
import { HeyAuthn } from "@semaphore-protocol/heyauthn"

// STEP 1: Configure WebAuthn options.

const options = {
    rpName: "my-app",
    rpID: window.location.hostname,
    userID: "my-id",
    userName: "my-name"
}

// STEP 2: Register a new WebAuthn credential and get its Semaphore identity.

const { identity } = await HeyAuthn.fromRegister(options)

// Now you could also save the identity commitment in your DB (pseudocode).
fetch("/api/register" /* Replace this with your endpoint */, {
    identity.commmitment
    // ...
})

// STEP 3: Authenticate existing WebAuthn credential and signal.

const { identity } = await HeyAuthn.fromRegister(options)

// Get existing group and signal anonymously (pseudocode).
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { utils } from "ethers"

const group = new Group("42")

group.addMembers(memberList)

const signal = utils.formatBytes32String("Hey anon!")

generateProof(identity, group, group.id, "42", {
    zkeyFilePath: "./semaphore.zkey",
    wasmFilePath: "./semaphore.wasm"
})
```

## Authors

-   [Vivek Bhupatiraju](https://github.com/vb7401)
-   [Richard Liu](https://github.com/rrrliu)
-   [emma](https://github.com/emmaguo13)
-   [Sehyun Chung](https://github.com/sehyunc)
-   [Enrico Bottazzi](https://github.com/enricobottazzi)
