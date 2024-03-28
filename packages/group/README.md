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
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40semaphore-protocol%2Fgroup?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/group">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/group?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/group">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/group.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.pse.dev/modules/_semaphore_protocol_group">
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

| This library is an abstraction of the LeanIMT data structure (part of [`@zk-kit/imt`](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/imt)). The main goal is to make it easier to create offchain groups, which are also used to generate Semaphore proofs. Semaphore groups are actually Merkle trees, and the group members are tree leaves. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

For more information on the functions provided by `@semaphore-protocol/group`, please refer to the [TypeDoc documentation](https://js.semaphore.pse.dev/modules/_semaphore_protocol_group).

\# **new Group**(members: _BigNumberish[]_ = []): _Group_

```typescript
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

const group1 = new Group()

const identity1 = new Identity()
const identity2 = new Identity()

const group2 = new Group([identity1.commitment, identity2.commitment])
```

\# **addMember**(member: _BigNumberish_)

```typescript
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

const group = new Group()

const { commitment } = new Identity()

group.addMember(commitment)

// 12989101133047504182892154686643420754368236204022364847543591045056549053997n
console.log(group.members[0])
```

\# **addMembers**(members: _BigNumberish[]_)

```typescript
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

const group = new Group()

const identity1 = new Identity()
const identity2 = new Identity()

group.addMembers([identity1.commitment, identity2.commitment])
```

\# **updateMember**(index: _number_, member: _BigNumberish_)

```typescript
import { Group } from "@semaphore-protocol/group"

const group = new Group([1n, 3n])

group.updateMember(0, 2)

console.log(group.members[0]) // "2n"
```

\# **removeMember**(index: _number_)

```typescript
import { Group } from "@semaphore-protocol/group"

const group = new Group([1n, 3n])

group.removeMember(0)

console.log(group.members[0]) // 0n
```

\# **indexOf**(member: _BigNumberish_): _number_

```typescript
import { Group } from "@semaphore-protocol/group"

const group = new Group([1n])

const index = group.indexOf(1)

console.log(index) // 0
```

\# **generateMerkleProof**(index: _number_): _MerkleProof_

```typescript
import { Group } from "@semaphore-protocol/group"

const group = new Group([1n, 3n])

const proof = group.generateMerkleProof(0)

console.log(proof)
/*
{
    index: 0,
    leaf: '1',
    root: '21106761926285267690763443010820487107972411248208546226053195422384279971821',
    siblings: [ '3' ]
}
*/
```

\# **export**(): _string_

```typescript
import { Group } from "@semaphore-protocol/group"

const group = new Group([1n, 2n, 3n])

const exportedGroup = group.export()

console.log(exportedGroup)
/*
[["1","2","3"],["7853200120776062878684798364095072458815029376092732009249414926327459813530","3"],["13816780880028945690020260331303642730075999758909899334839547418969502592169"]]
*/
```

\# **import**(exportedGroup: _string_): _Group_

```typescript
import { Group } from "@semaphore-protocol/group"

const group1 = new Group([1n, 2n, 3n])

const exportedGroup = group.export()

const group2 = Group.import(exportedGroup)

assert(group1.root === group2.root)
```
