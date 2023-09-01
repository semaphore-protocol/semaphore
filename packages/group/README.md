<p align="center">
    <h1 align="center">
        Semaphore group
    </h1>
    <p align="center">A library to create and manage Semaphore groups.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/group">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/group?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/group">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/group.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/group">
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

| This library is an abstraction of [`@zk-kit/incremental-merkle-tree`](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/incremental-merkle-tree). The main goal is to make it easier to create offchain groups, which are also used to generate Semaphore proofs. Semaphore groups are actually incremental Merkle trees, and the group members are tree leaves. Since the Merkle tree implementation we are using is a binary tree, the maximum number of members of a group is equal to `2^treeDepth`. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/group` package with npm:

```bash
npm i @semaphore-protocol/group
```

or yarn:

```bash
yarn add @semaphore-protocol/group
```

## 📜 Usage

\# **new Group**(groupId: _Member_, treeDepth = 20): _Group_

```typescript
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

// Group with max 1048576 members (20^²).
const group1 = new Group(1)

// Group with max 65536 members (16^²).
const group2 = new Group(1, 16)

// Group with max 16777216 members (24^²).
const group3 = new Group(1, 24)

// Group with a list of predefined members.
const identity1 = new Identity()
const identity2 = new Identity()
const identity3 = new Identity()

const group3 = new Group(1, 16, [identity1.commitment, identity2.commitment, identity3.commitment])
```

\# **addMember**(identityCommitment: _Member_)

```typescript
import { Identity } from "@semaphore-protocol/identity"

const identity = new Identity()
const commitment = identity.generateCommitment()

group.addMember(commitment)
```

\# **removeMember**(index: _number_)

```typescript
group.removeMember(0)
```

\# **indexOf**(member: _Member_): _number_

```typescript
group.indexOf(commitment) // 0
```

\# **generateMerkleProof**(index: _number_): _MerkleProof_

```typescript
const proof = group.generateMerkleProof(0)
```
