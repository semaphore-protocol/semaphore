<p align="center">
    <h1 align="center">
      <img width="40" src="https://github.com/appliedzkp/semaphore/blob/main/docs/static/img/semaphore-icon.svg">  
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
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

The core of the Semaphore protocol is in the [circuit logic](/circuits/scheme.png). However Semaphore also provides [Solidity contracts](/contracts) and [JavaScript libraries](https://github.com/appliedzkp/zk-kit) (i.e. `@zk-kit/identity` and `@zk-kit/protocols`) to make the steps for offchain proof creation and onchain verification easier. To learn more about Semaphore visit https://semaphore.appliedzkp.org.

⚠️ Semaphore V2 has not yet been audited. Please do not use it in production. You can find Semaphore V1 on [`version/1.0.0`](https://github.com/appliedzkp/semaphore/tree/version/1.0.0).

## Deployed verifiers

The following is a list of our deployed onchain verifiers. Each `Verifier.sol` contract can be used with a binary tree of a certain depth. If depth = 20 the tree can have maximum 2^20 leaves (a group of 1048576 members).

| Depth | Kovan                                                                                          | Arbitrum One |
| ----- | ---------------------------------------------------------------------------------------------- | ------------ |
| 20    | [0xed75...0E18](https://kovan.etherscan.io/address/0xed7582b4da6ADaFA0579cF7Ff7DF0812633b0E18) |              |
