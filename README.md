<p align="center">
    <h1 align="center">
      <img width="40" src="https://github.com/appliedzkp/semaphore/blob/main/docs/static/img/semaphore.png">  
      Semaphore
    </h1>
    <p align="center">A privacy gadget for creating anonymous proof of membership on Ethereum.</p>
</p>

<p align="center">
    <a href="https://github.com/appliedzkp/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/appliedzkp/semaphore.svg?style=flat-square">
    </a>
    <a href="https://github.com/appliedzkp/semaphore/actions?query=workflow%3Adocs">
        <img alt="GitHub Workflow docs" src="https://img.shields.io/github/workflow/status/appliedzkp/semaphore/docs?label=docs&style=flat-square&logo=github">
    </a>
    <a href="https://github.com/appliedzkp/semaphore/actions?query=workflow%3Atest">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/workflow/status/appliedzkp/semaphore/test?label=test&style=flat-square&logo=github">
    </a>
    <a href="https://coveralls.io/github/appliedzkp/semaphore">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/appliedzkp/semaphore?style=flat-square&logo=coveralls">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
</p>

<div align="center">
    <h4>
        <a href="/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/appliedzkp/zk-kit/issues/new/choose">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://t.me/joinchat/B-PQx1U3GtAh--Z4Fwo56A">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Semaphore is a zero-knowledge gadget which allows Ethereum users to prove their membership of a set without revealing their original identity. At the same time, it allows users to signal their endorsement of an arbitrary string. It is designed to be a simple and generic privacy layer for Ethereum DApps. Use cases include private voting, whistleblowing, mixers, and anonymous authentication. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

The core of the Semaphore protocol is in the [circuit logic](/circuits/scheme.png), however Semaphore provides [Solidity contracts](/contracts) and [JavaScript libraries](https://github.com/appliedzkp/zk-kit) to make the steps for offchain proof creation and onchain verification simple.

## 🛠 Install

You can install our Semaphore packages with `npm`:

```bash
npm i @zk-kit/identity @zk-kit/protocols @appliedzkp/semaphore-contracts --save
```

or `yarn`:

```bash
yarn add @zk-kit/identity @zk-kit/protocols @appliedzkp/semaphore-contracts
```

## 📜 Usage

### Contracts

When using Semaphore contracts keep in mind that there are two types of contracts:

* **Base contracts**: they allow you to use the main fatures of the protocol (i.e. verify a proof or manage Merkle trees/groups).
* **Extension contracts**: they contain application logic and could be used for specific use-cases (e.g. anonymous voting).

Our current available extension contracts can be a good example of how base contracts can be used.

### ZK-kit libraries

When using Semaphore each user will need to create their own identity, which will then be added to a group. [`@zk-kit/identity`](https://github.com/appliedzkp/zk-kit/tree/main/packages/identity) allows users to create and manage their identities, while [`@zk-kit/protocols`](https://github.com/appliedzkp/zk-kit/tree/main/packages/protocols) allows users to create Semaphore proofs to prove their group membership and signal their endorsement of an arbitrary string anonymously.
