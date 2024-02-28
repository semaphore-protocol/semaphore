---
sidebar_position: 1
---

# Private voting use case

The private voting use case describes how Semaphore interacts with your users and Ethereum to allow users to cast private votes in your application.
Learn how Semaphore enables applications to do the following:

-   Register members as voters.
-   Allow members to vote anonymously.
-   Prove voter membership.
-   Record and prove votes.
-   Prevent double-voting.

## Roles

-   **[Developer or community admin](#developer-or-community-admin)**
-   **[Community member (dApp user)](#community-member)**
-   **[Relay](#relay)**

### Developer or community admin

As a developer or community admin, you deploy the following:

-   **Smart contract on Ethereum**: implements the Semaphore **base contract** to create a poll (Semaphore **group** that members join to vote), post transactions, and verify proofs on Ethereum.
-   **Decentralized application (dApp)**: your application that provides a user interface (UI) where members join a poll and vote on a proposal.

### Community member

Community members connect their wallets to the dApp to take the following actions:

1. Verify ownership of the community token.
2. Generate an anonymous ID.
3. Cast a vote.

### Relay

To preserve anonymity and avoid disclosing the member's wallet address, the dApp may use a [relay](/glossary/#relay) to broadcast the vote.
The relay calls the **contract** function that then posts the member's vote transaction to Ethereum.

## Private voting

Consider a scenario where your community issues a token that users can mint.
The token might be a Proof of Attendance (POAP), NFT, or social token that your users can mint to receive membership and vote in your community.

The voting scenario has the following steps:

1. [Create a poll](#create-a-poll): Coordinator creates a poll, or _group_, in which members can vote on a proposal.
2. [Register voters](#register-voters): Members join the poll to vote.
3. [Record votes](#record-votes): Once the poll opens, members may cast one vote, or _signal_, on the topic.

### Create a poll

A community coordinator or dApp administrator uses the deployed smart contract to create an on-chain (Ethereum) poll, a [Semaphore group](/guides/groups/) that members can join and cast votes to.

In the following sample code, the voting contract declares a `createPoll` function that uses the Semaphore base `_createGroup` function:

```ts title="https://github.com/semaphore-protocol/semaphore/blob/v3.15.1/packages/contracts/contracts/extensions/SemaphoreVoting.sol"

function createPoll(
    uint256 pollId,
    address coordinator,
    uint8 depth
) public override {
    require(address(verifiers[depth]) != address(0), "SemaphoreVoting: depth value is not supported");

    _createGroup(pollId, depth, 0);

    Poll memory poll;

    poll.coordinator = coordinator;

    polls[pollId] = poll;

    emit PollCreated(pollId, coordinator);
}
```

A poll is a Semaphore [group](/guides/groups/) that stores the following:

-   A topic to vote on.
-   The public ID of the poll creator.
-   [Semaphore IDs](/guides/identities/) of members who joined the poll.

To create the poll, the administrator calls the smart contract function--for example:

```ts
SemaphoreVoting.createPoll(pollId, coordinator, depth)
```

Next, learn how to [register voters](#register-voters) for the poll.

### Register voters

Before a user can register to vote, the dApp needs to verify membership by checking the user's wallet for the NFT.
To grant access to the wallet, the user clicks a `Connect wallet` button in the dApp and allows the dApp to check for the NFT.
Once a member is verified, the dApp provides the following member interactions:

1. [Generate a private identity](#generate-a-private-identity).
2. [Join a poll](#join-a-poll).

:::info
To learn how to connect to Ethereum wallets, visit the [ethers.js Getting Started documentation](https://docs.ethers.io/v5/getting-started).
:::

#### Generate a private identity

To generate a private identity, the member completes a form in the dApp UI.
With the form values and the `@semaphore-protocol/identity` library, the dApp prompts the member to sign a wallet message and then generates the signed private identity.
The private identity is known only to the member and can be used in future interactions with the dApp.

Next, learn how members [join a poll](#join-a-poll).

#### Join a poll

Once the member has a private identity for the dApp, the member may select a poll to vote in.
When the member selects a poll, the dApp does the following:

1. Uses the `@semaphore-protocol/identity` library to generate an anonymous Semaphore ID, or _identity commitment_, from the private identity.
2. Calls a contract function that adds the new Semaphore ID to the on-chain poll.

With a member registered for a poll, learn how the dApp [records votes](#record-votes).

### Record votes

Once members have joined a poll, the coordinator starts the poll to allow voting.
When a member votes (for example, by selecting a radio button), then the dApp takes the following actions:

1. Uses the `@semaphore-protocol/proof` library to create a proof of the vote, the poll identifier, the Semaphore ID, and a [nullifier](/glossary/#nullifier) that prevents double-voting.
2. Sends the vote proof to the [relay](#relay).

### Related

-   To get started developing with Semaphore, see the [Quick setup](/V2/quick-setup/) guide.
-   For an example app that you can use to start your own project, see [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate).
