---
sidebar_position: 2
title: Groups
---

# Semaphore groups

<!--Working outline
- What is a group
- What do groups contain
  - Identities
  - Root

- What are they used for
- Create a group
- Use a group
- Add identities
- Remove identities
-->

Use Semaphore in your application or smart contract to create off-chain and on-chain groups.

A [Semaphore group](/docs/glossary/#semaphore-group) contains [identity commitments](/docs/glossary/#identity-commitment) of group members.
Example uses of groups include the following:

-   Poll question that attendees join to rate an event.
-   Ballot that members join to vote on a proposal.
-   Whistleblowers who are verified employees of an organization.

A Semaphore group is an [incremental Merkle tree](/docs/glossary/#incremental-merkle-tree), and group members (i.e., [identity commitments](/docs/glossary/#identity-commitments)) are tree leaves.
Semaphore groups set the following two parameters:

-   **Tree depth**: the maximum number of members a group can contain (`max size = 2 ^ tree depth`).
-   **Zero value**: the value used to calculate the zero nodes of the incremental Merkle tree.

Learn how to work with groups.

-   [**Off-chain groups**](#off-chain-groups)
-   [**On-chain groups**](#on-chain-groups)

## Off-chain groups

-   [Create a group](#create-a-group)
-   [Add members](#add-members)
-   [Remove or update members](#remove-or-update-members)

### Create a group

Use the [`@semaphore-protocol/group`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/group) library `Group` class to create an off-chain group.

#### Options

-   **Tree depth**: (_default `20`_) the maximum number of members a group can contain (`max size = 2 ^ tree depth`).
-   **Zero value**: (_default `BigInt(0)`_) the value for a tree node that doesn't have a member assigned.

To create a group with default _`treeDepth`_ and _`zeroValue`_, call the `Group` constructor without parameters--for example:

```ts
import { Group } from "@semaphore-protocol/group"

// Default parameters: treeDepth = 20, zeroValue = BigInt(0).
const group = new Group()
```

The following example code passes _`treeDepth`_ to create a group for `2 ^ 30 = 1073741824` members:

```ts
import { Group } from "@semaphore-protocol/group"

const group = new Group(30)
```

The following example code creates a group with a _`zeroValue`_ of `BigInt(1)`:

```ts
import { Group } from "@semaphore-protocol/group"

const group = new Group(20, BigInt(1))
```

### Add members

Use the `Group addMember` function to add a member (identity commitment) to a group--for example:

```ts
group.addMember(identityCommitment)
```

To add a batch of members to a group, pass an array to the `Group addMembers` function--for example:

```ts
group.addMembers([identityCommitment1, identityCommitment2])
```

### Remove or update members

To remove members from a group, pass the member index to the `Group removeMember` function--for example:

```ts
group.removeMember(0)
```

To update members in a group, pass the member index and the new value to the `Group updateMember` function--for example:

```ts
group.updateMember(0, 2)
```

:::caution
Removing a member from a group sets the node value to `zeroValue`.
Given that the node isn't removed, and the length of the `group.members` array doesn't change.
:::

## On-chain groups

The [`SemaphoreGroups`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/base/SemaphoreGroups.sol) contract uses the [`IncrementalBinaryTree`](https://github.com/privacy-scaling-explorations/zk-kit/blob/main/packages/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol) library and provides methods to create and manage groups.

:::info
You can import `SemaphoreGroups` and other Semaphore contracts from the [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts) NPM module.
:::

Alternatively, you can use an already deployed [`Semaphore`](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1/packages/contracts/contracts/Semaphore.sol) contract and use its group external functions.
