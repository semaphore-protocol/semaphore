<p align="center">
    <h1 align="center">
        Semaphore subgraph
    </h1>
    <p align="center">A library to query Semaphore contracts.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/subgraph">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/subgraph?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/subgraph">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/subgraph.svg?style=flat-square" />
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
        <a href="https://discord.gg/6mSdGHnstH">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library allows you to query the [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/contracts/Semaphore.sol) contract data (i.e. groups) using the [Semaphore subgraph](https://github.com/semaphore-protocol/subgraph) on Kovan, Goerli, and Arbitrum One. It can be used on Node.js and browsers. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/subgraph` package with npm:

```bash
npm i @semaphore-protocol/subgraph
```

or yarn:

```bash
yarn add @semaphore-protocol/subgraph
```

### CDN

You can also load it using a `script` tag using [unpkg](https://unpkg.com/):

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://unpkg.com/@semaphore-protocol/subgraph/"></script>
```

or [JSDelivr](https://www.jsdelivr.com/):

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@semaphore-protocol/subgraph/"></script>
```

## 📜 Usage

\# **new Subgraph**(network: _Network_ = "arbitrum" ): _Subgraph_

```typescript
import { Subgraph } from "@semaphore-protocol/subgraph"

const subgraph = new Subgraph()
```

\# **getGroups**(options?: _GroupOptions_)

```typescript
const groups = subgraph.getGroups()

// or

const groups = subgraph.getGroups({ members: true, verifiedProofs: true })
```

\# **getGroup**(groupId: _string_, options?: _GroupOptions_)

```typescript
const group = subgraph.getGroup("1")

// or

const { members, verifiedProofs } = subgraph.getGroup("1", {
    members: true,
    verifiedProofs: true
})
```
