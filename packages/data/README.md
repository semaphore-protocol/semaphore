<p align="center">
    <h1 align="center">
        Semaphore data
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
    <a href="https://www.npmjs.com/package/@semaphore-protocol/data">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/data?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/data">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/data.svg?style=flat-square" />
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

| This library allows you to query the [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/contracts/Semaphore.sol) contract data (i.e. groups) using the [Semaphore subgraph](https://github.com/semaphore-protocol/subgraph) or Ethers. It can be used on Node.js and browsers. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/data` package with npm:

```bash
npm i @semaphore-protocol/data
```

or yarn:

```bash
yarn add @semaphore-protocol/data
```

## 📜 Usage

\# **new SemaphoreSubgraph**(networkOrSubgraphURL: _Network_ | _string_ = "goerli"): _SemaphoreSubgraph_

```typescript
import { SemaphoreSubgraph } from "@semaphore-protocol/data"

const semaphoreSubgraph = new SemaphoreSubgraph()

// or:
const semaphoreSubgraph = new SemaphoreSubgraph("arbitrum")

// or:
const semaphoreSubgraph = new SemaphoreSubgraph(
    "https://api.studio.thegraph.com/query/14377/<your-subgraph>/<your-version>"
)
```

\# **getGroupIds**(): _Promise<string\[]>_

```typescript
const groupIds = semaphoreSubgraph.getGroupIds()
```

\# **getGroups**(options?: _GroupOptions_): _Promise<GroupResponse\[]>_

```typescript
const groups = semaphoreSubgraph.getGroups()

// or

const groups = semaphoreSubgraph.getGroups({ members: true, verifiedProofs: true })
```

\# **getGroup**(groupId: _string_, options?: _GroupOptions_): _Promise<GroupResponse>_

```typescript
const group = semaphoreSubgraph.getGroup("42")

// or

const { members, verifiedProofs } = semaphoreSubgraph.getGroup("42", { members: true, verifiedProofs: true })
```

\# **new Ethers**(networkOrEthereumURL: Network | string = "goerli", options: EthersOptions = {}): _SemaphoreEthers_

```typescript
import { SemaphoreEthers } from "@semaphore-protocol/data"

const semaphoreEthers = new SemaphoreEthers()

// or:
const semaphoreEthers = new SemaphoreEthers("homestead", {
    address: "semaphore-address",
    startBlock: 0
})

// or:
const semaphoreEthers = new SemaphoreEthers("http://localhost:8545", {
    address: "semaphore-address"
})
```

\# **getGroupIds**(): _Promise<string\[]>_

```typescript
const groupIds = semaphoreEthers.getGroupIds()
```

\# **getGroup**(groupId: _string_): _Promise<GroupResponse>_

```typescript
const group = semaphoreEthers.getGroup("42")
```

\# **getGroupAdmin**(groupId: _string_): _Promise<string>_

```typescript
const admin = semaphoreEthers.getGroupAdmin("42")
```

\# **getGroupMembers**(groupId: _string_): _Promise<string\[]>_

```typescript
const members = semaphoreEthers.getGroupMembers("42")
```

\# **getGroupVerifiedProofs**(groupId: _string_): _Promise<any\[]>_

```typescript
const verifiedProofs = semaphoreEthers.getGroupVerifiedProofs()
```
