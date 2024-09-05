<p align="center">
    <h1 align="center">
         Lean Incremental Merkle Tree (Solidity)
    </h1>
    <p align="center">Lean Incremental Merkle tree implementation in Solidity.</p>
</p>

<p align="center">
    <a href="https://github.com/privacy-scaling-explorations/zk-kit.solidity">
        <img src="https://img.shields.io/badge/project-zk--kit-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/privacy-scaling-explorations/zk-kit.solidity/tree/main/packages/imt.sol/contracts/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40zk-kit%2Flean-imt.sol?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@zk-kit/lean-imt.sol">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@zk-kit/lean-imt.sol?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@zk-kit/lean-imt.sol">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@zk-kit/lean-imt.sol.svg?style=flat-square" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://appliedzkp.org/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

> [!NOTE]  
> This library has been audited as part of the Semaphore V4 PSE audit: https://semaphore.pse.dev/Semaphore_4.0.0_Audit.pdf.

The LeanIMT is an optimized binary version of the [IMT](https://github.com/privacy-scaling-explorations/zk-kit.solidity/tree/main/packages/imt) into binary-focused model, eliminating the need for zero values and allowing dynamic depth adjustment. Unlike the IMT, which uses a zero hash for incomplete nodes, the LeanIMT directly adopts the left child's value when a node lacks a right counterpart. The tree's depth dynamically adjusts to the count of leaves, enhancing efficiency by reducing the number of required hash calculations. To understand more about the LeanIMT, take a look at this [visual explanation](https://hackmd.io/@vplasencia/S1whLBN16).

---

## 🛠 Install

### npm or yarn

Install the `@zk-kit/lean-imt.sol` package with npm:

```bash
npm i @zk-kit/lean-imt.sol --save
```

or yarn:

```bash
yarn add @zk-kit/lean-imt.sol
```

## 📜 Usage

Please, see the [test contracts](./test) for guidance on utilizing the libraries.
