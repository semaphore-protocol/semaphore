<p align="center">
    <h1 align="center">
        Semaphore group
    </h1>
    <p align="center">A library to create and manage Semaphore groups.</p>
</p>

<p align="center">
    <a href="https://github.com/webb-tools">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/webb-tools/semaphore-anchor/blob/develop/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/webb-tools/semaphore-anchor.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@webb-tools/semaphore-group">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@webb-tools/semaphore-group?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@webb-tools/semaphore-group">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@webb-tools/semaphore-group.svg?style=flat-square" />
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
        <a href="https://github.com/webb-tools/semaphore/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/webb-tools/semaphore/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/webb-tools/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://discord.gg/6mSdGHnstH">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library is an abstraction of [`@zk-kit/incremental-merkle-tree`](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/incremental-merkle-tree). The main goal is to make it easier to create offchain groups, which are also used to generate Semaphore proofs. Semaphore maingroups are actually incremental Merkle trees, and the group members are tree leaves. Since the Merkle tree implementation we are using is a binary tree, the maximum number of members of a group is equal to `2^treeDepth`. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

## 🛠 Install

### npm or yarn

Install the `@webb-tools/semaphore-group` package with npm:

```bash
npm i @webb-tools/semaphore-group
```

or yarn:

```bash
yarn add @webb-tools/semaphore-group
```

## 📜 Usage

\# **new Group**(treeDepth = 20, zeroValue = BigInt(0)): _Group_

```typescript
import { Group } from "@webb-tools/semaphore-group"

// Group with max 1048576 members (20^²).
const group1 = new Group()

// Group with max 65536 members (16^²).
const group2 = new Group(16)

// Group with max 16777216 members (24^²).
const group3 = new Group(24)
```

\# **addMember**(identityCommitment: _Member_)

```typescript
import { Identity } from "@webb-tools/identity"

const identity = new Identity()
const commitment = identity.generateCommitment()

group.addMember(commitment)
```

\# **addMembers**(identityCommitments: _Member\[]_)

```typescript
let identityCommitments: bigint[]

for (let i = 0; i < 10; i++) {
    const identity = new Identity()
    const commitment = identity.generateCommitment()

    identityCommitments.push(commitment)
}

group.addMember(identityCommitments)
```

\# **removeMember**(index: _number_)

```typescript
group.removeMember(0)
```

\# **indexOf**(member: _Member_): _number_

```typescript
group.indexOf(commitment) // 0
```

\# **generateProofOfMembership**(index: _number_): _MerkleProof_

```typescript
const proof = group.generateProofOfMembership(0)
```
