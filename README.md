<p align="center">
    <h1 align="center">
      <img width="40" src="https://github.com/semaphore-protocol/website/blob/main/static/img/semaphore-icon.svg">  
      Semaphore
    </h1>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/actions?query=workflow%3Atest">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/workflow/status/semaphore-protocol/semaphore/test?label=test&style=flat-square&logo=github">
    </a>
    <a href="https://coveralls.io/github/semaphore-protocol/semaphore">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/semaphore-protocol/semaphore?style=flat-square&logo=coveralls">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/semaphore-protocol/semaphore?style=flat-square">
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
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
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

The core of the Semaphore protocol is in the [circuit logic](/circuits/scheme.png). However Semaphore also provides [Solidity contracts](/contracts) (NPM: `@semaphore-protocol/contracts`) and [JavaScript libraries](https://github.com/privacy-scaling-explorations/zk-kit) (NPM: `@zk-kit/identity`, `@zk-kit/protocols`) to make the steps for offchain proof creation and onchain verification easier. To learn more about Semaphore visit https://semaphore.appliedzkp.org.

⚠️ Semaphore V2 has not yet been audited. Please do not use it in production. You can find Semaphore V1 on [`version/1.0.0`](https://github.com/semaphore-protocol/semaphore/tree/version/1.0.0).

## Deployed contracts

You can choose to deploy our Semaphore contracts yourself or you can use the following pre-deployed contracts. 

### Verifiers

Each of the following verifier contracts can verify zero-knowledge proofs generated with a specific tree depth. The depth of the tree determines the size of the Semaphore groups you can create. A depth = 20 means that the tree can have a maximum number of leaves = 2^20 (i.e. maximum number of group members = 1048576).

| Depth | Kovan                                                                                          | Goerli                                                                                          | Arbitrum One |
| ----- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| 16    | [0x348e...A453](https://kovan.etherscan.io/address/0x348e6191ceAB90F9B79Ad72Bc8f9D25670d0A453) | [0x54fE...c5BA](https://goerli.etherscan.io/address/0x54fEA72bC88767f7eC29b1cec22A82BE5766c5BA) |              |
| 17    | [0x59DA...fd61](https://kovan.etherscan.io/address/0x59DAF80BeD590ad1eBeA44Accd5E3F629b6Dfd61) | [0x0822...E828](https://goerli.etherscan.io/address/0x08221A11C6CF9158c7408Fb7E4D038F942f6E828) |              |
| 18    | [0xeF21...4a04](https://kovan.etherscan.io/address/0xeF21d72D8340cB759e6B67CA7FAf86871b4b4a04) | [0x00AC...D8Ed](https://goerli.etherscan.io/address/0x00ACC63f2e76C31B63352d2258474af596e3D8Ed) |              |
| 19    | [0x33Ce...073B](https://kovan.etherscan.io/address/0x33Ce0445bc08C12916d169FFc6500adAbe6E073B) | [0x73B6...1e82](https://goerli.etherscan.io/address/0x73B67Df94BD8cBB08F57c3Da7b2BFD0d15dC1e82) |              |
| 20    | [0xF81c...20b0](https://kovan.etherscan.io/address/0xF81c20E4faf223b77A9eb2610113cb07f9f320b0) | [0x6fFE...bF4A](https://goerli.etherscan.io/address/0x6fFEC9eF6a255caB8b3405800a4e12942242bF4A) |              |
| 21    | [0x611e...4A44](https://kovan.etherscan.io/address/0x611eB9a5D86d146BB26bcF93f27ce38eC96D4A44) | [0x7579...E68A](https://goerli.etherscan.io/address/0x7579bcA9f799f7FF1EB08E913617a1DB78f7E68A) |              |
| 22    | [0xb413...5869](https://kovan.etherscan.io/address/0xb41369cf49Bb6d5b7788411AFe86F3618B845869) | [0x70f1...f5B8](https://goerli.etherscan.io/address/0x70f1EaC8A1cbE50cb5C1842535432eA4F144f5B8) |              |
| 23    | [0x4B7a...C41a](https://kovan.etherscan.io/address/0x4B7a19fCfDF95d9439924Afbbdc009d1f8B5C41a) | [0x93E4...0048](https://goerli.etherscan.io/address/0x93E427B4194B39fBf9FeEED5167CE08C010A0048) |              |
| 24    | [0x0466...4419](https://kovan.etherscan.io/address/0x04663EC5c73152Fc0EC1F93E311ABbfeB4404419) | [0x6631...8c54](https://goerli.etherscan.io/address/0x66314414b52e2B1FCc0a43730D97C92FEe938c54) |              |
| 25    | [0x0529...7810](https://kovan.etherscan.io/address/0x05291D3b9494643CD3c3a8C838e6B41958387810) | [0x0A54...E415](https://goerli.etherscan.io/address/0x0A54351aE7fF29B15A3EAFA601175056BA65E415) |              |
| 26    | [0xfA5D...3C4D](https://kovan.etherscan.io/address/0xfA5D12Eabd1B252371A24C099B12A081C0923C4D) | [0xEEf3...D11a](https://goerli.etherscan.io/address/0xEEf3a587973e88b8452493dA21950BCF8C49D11a) |              |
| 27    | [0x399F...63dF](https://kovan.etherscan.io/address/0x399Fc7C86DDF09f6162F9374Ff3Bcbf1848463dF) | [0xE34c...8CcD](https://goerli.etherscan.io/address/0xE34c3AE8de66E319347CFd36abF841552dd28CcD) |              |
| 28    | [0x9EEE...0E58](https://kovan.etherscan.io/address/0x9EEE3D807764350478069bDA1Ed704D076650E58) | [0x0dea...2C52](https://goerli.etherscan.io/address/0x0dea31A9Db4aed6bb71603f4E48dd75605222C52) |              |
| 29    | [0xBA08...5dE7](https://kovan.etherscan.io/address/0xBA0814dE8d67054762676eff2Bd974303Ac35dE7) | [0x46b7...b061](https://goerli.etherscan.io/address/0x46b753820C94656B549f111BC666c8a3b709b061) |              |
| 30    | [0x10fe...9964](https://kovan.etherscan.io/address/0x10feB32DE2629ce2e0ADDeD68786862dFc049964) | [0x0338...80Ca](https://goerli.etherscan.io/address/0x03387af03cA6052369D4ab11C497F0B785b680Ca) |              |
| 31    | [0x8932...4aCA](https://kovan.etherscan.io/address/0x89326dBa5Bb6F1428A85e8CCEF6dd15f609e4aCA) | [0xc068...6fA3](https://goerli.etherscan.io/address/0xc068f3F15f367a60eb2B7c0620961A15A3b36fA3) |              |
| 32    | [0xDA5D...c06e](https://kovan.etherscan.io/address/0xDA5D350B6c3E7D144311e08CCFF7a5C893f0c06e) | [0xb668...6bC8](https://goerli.etherscan.io/address/0xb6681C79C389e898906DFA65002698A7CA296bC8) |              |

### Semaphore

Semaphore also provides a [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/contracts/Semaphore.sol) contract that you can use to create groups and verify zero-knowledge proof. It can be useful if you want to save gas by avoiding deploying the base Semaphore contracts yourself with inheritance.

| Kovan                                                                                          | Goerli                                                                                          | Arbitrum One |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| [0xb3F1...65B5](https://kovan.etherscan.io/address/0xb3F137b4bDB3791e42743D2002538D06f24c65B5) | [0xCEF7...8537](https://goerli.etherscan.io/address/0xCEF7D35b0dE6F246C835AF504A8AD2585f548537) |              |
