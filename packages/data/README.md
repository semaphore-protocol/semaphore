<p align="center">
    <h1 align="center">
        Semaphore data
    </h1>
    <p align="center">A library for querying Semaphore smart contract.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fdata?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/data">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/data?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/data">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/data.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_data">
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

| This library provides tools for querying and interacting with the [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/Semaphore.sol) smart contract. It supports the Semaphore subgraph and direct Ethereum network connections via Ethers or Viem. Designed for use in both Node.js and browser environments, it facilitates the management of group data and verification processes within the Semaphore protocol. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

For detailed information on the functions provided by `@semaphore-protocol/data`, please refer to the [TypeDoc documentation](https://js.semaphore.pse.dev/modules/_semaphore_protocol_data).

### Creating and Managing Subgraphs

**Initialize a Semaphore Subgraph instance**

```typescript
import { SemaphoreSubgraph } from "@semaphore-protocol/data"

const semaphoreSubgraph = new SemaphoreSubgraph()

// or:
const semaphoreSubgraphOnArbitrum = new SemaphoreSubgraph("arbitrum")

// or:
const customSubgraph = new SemaphoreSubgraph(
    "https://api.studio.thegraph.com/query/14377/<your-subgraph>/<your-version>"
)
```

With your SemaphoreSubgraph, you can:

**Query Group IDs**

```typescript
const groupIds = await semaphoreSubgraph.getGroupIds()
```

**Query Group Details**

```typescript
const group = await semaphoreSubgraph.getGroup("42")
const { members, verifiedProofs } = await semaphoreSubgraph.getGroup("42", { members: true, verifiedProofs: true })
```

**Query Group Members**

```typescript
const members = await semaphoreSubgraph.getGroupMembers("42")
```

**Query Verified Proofs**

```typescript
const verifiedProofs = await semaphoreSubgraph.getGroupVerifiedProofs("42")
```

**Check Group Membership**

```typescript
const isMember = await semaphoreSubgraph.isGroupMember(
    "42",
    "16948514235341957898454876473214737047419402240398321289450170535251226167324"
)
```

### Using Ethers for Direct Blockchain Interaction

**Initialize a Semaphore Ethers instance**

```typescript
import { SemaphoreEthers } from "@semaphore-protocol/data"

const semaphoreEthers = new SemaphoreEthers()

// or:
const semaphoreEthersOnHomestead = new SemaphoreEthers("homestead", {
    address: "semaphore-address",
    startBlock: 0
})

// or:
const localEthersInstance = new SemaphoreEthers("http://localhost:8545", {
    address: "semaphore-address"
})
```

With your SemaphoreEthers instance, you can:

**Fetch Group IDs**

```typescript
const groupIds = await semaphoreEthers.getGroupIds()
```

**Fetch Group Details**

```typescript
const group = await semaphoreEthers.getGroup("42")
```

**Fetch Group Admin**

```typescript
const admin = await semaphoreEthers.getGroupAdmin("42")
```

**Fetch Group Members**

```typescript
const members = await semaphoreEthers.getGroupMembers("42")
```

**Fetch Validated Proofs**

```typescript
const verifiedProofs = await semaphoreEthers.getGroupValidatedProofs("42")
```

**Check Group Membership**

```typescript
const isMember = await semaphoreEthers.isGroupMember(
    "42",
    "16948514235341957898454876473214737047419402240398321289450170535251226167324"
)
```

### Using Viem for Direct Blockchain Interaction

**Initialize a Semaphore Viem instance**

```typescript
import { SemaphoreViem } from "@semaphore-protocol/data"

const semaphoreViem = new SemaphoreViem()

// or:
const semaphoreViemOnSepolia = new SemaphoreViem("sepolia", {
    address: "semaphore-address",
    startBlock: 0n
})

// or:
const localViemInstance = new SemaphoreViem("http://localhost:8545", {
    address: "semaphore-address"
})
```

With your SemaphoreViem instance, you can:

**Fetch Group IDs**

```typescript
const groupIds = await semaphoreViem.getGroupIds()
```

**Fetch Group Details**

```typescript
const group = await semaphoreViem.getGroup("42")
```

**Fetch Group Members**

```typescript
const members = await semaphoreViem.getGroupMembers("42")
```

**Fetch Validated Proofs**

```typescript
const validatedProofs = await semaphoreViem.getGroupValidatedProofs("42")
```

**Check Group Membership**

```typescript
const isMember = await semaphoreViem.isGroupMember(
    "42",
    "16948514235341957898454876473214737047419402240398321289450170535251226167324"
)
```
