<p align="center">
    <h1 align="center">
        Excubiae
    </h1>
    <p align="center">A flexible and modular framework for general-purpose on-chain gatekeepers.</p>
</p>

<p align="center">
    <a href="https://github.com/privacy-scaling-explorations/excubiae">
        <img src="https://img.shields.io/badge/project-excubiae-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/privacy-scaling-explorations/excubiae/blob/main/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/excubiae?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/excubiae">
        <img alt="NPM version" src="https://img.shields.io/npm/v/excubiae?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/excubiae">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/excubiae.svg?style=flat-square" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://appliedzkp.org/discord">
            🗣️ Chat & Support
        </a>
    </h4>
</div>

> [!NOTE]  
> This library is experimental and untested yet - use at your own discretion...

Excubiae is a generalized framework for on-chain gatekeepers that allows developers to define custom access control mechanisms using different on-chain credentials. By abstracting the gatekeeper logic, excubiae provides a reusable and composable solution for securing decentralised applications. This package provides a pre-defined set of specific excubia (_extensions_) for credentials based on different protocols.

## 🛠 Install

### npm or yarn

Install the ` @zk-kit/excubiae` package with npm:

```bash
npm i @zk-kit/excubiae --save
```

or yarn:

```bash
yarn add @zk-kit/excubiae
```

## 📜 Usage

To build your own Excubia:

1. Inherit from the [Excubia](./Excubia.sol) abstract contract that conforms to the [IExcubia](./IExcubia.sol) interface.
2. Implement the `_check()` and `_pass()` methods logic defining your own checks to prevent unwanted access as sybils or avoid to pass the gate twice with the same data / identity.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Excubia } from "excubiae/contracts/Excubia.sol";

contract MyExcubia is Excubia {
    // ...

    function _pass(address passerby, bytes calldata data) internal override {
        // Implement your logic to prevent unwanted access here.
    }

    function _check(address passerby, bytes calldata data) internal view override {
        // Implement custom access control logic here.
    }

    // ...
}
```

Please see the [extensions](./extensions/) folder for more complex reference implementations and the [test contracts](./test) folder for guidance on using the libraries.
