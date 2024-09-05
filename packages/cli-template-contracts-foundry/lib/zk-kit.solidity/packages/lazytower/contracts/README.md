<p align="center">
    <h1 align="center">
         LazyTower (Solidity)
    </h1>
    <p align="center">LazyTower Solidity library.</p>
</p>

<p align="center">
    <a href="https://github.com/privacy-scaling-explorations/zk-kit.solidity">
        <img src="https://img.shields.io/badge/project-zk--kit-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/privacy-scaling-explorations/zk-kit.solidity/tree/main/packages/lazytower.sol/LICENSE">
        <img alt="NPM license" src="https://img.shields.io/npm/l/%40zk-kit%2Flazytower.sol?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@zk-kit/lazytower.sol">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@zk-kit/lazytower.sol?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@zk-kit/lazytower.sol">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@zk-kit/lazytower.sol.svg?style=flat-square" />
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

> [!WARNING]  
> These library has **not** been audited.

---

## 🛠 Install

### npm or yarn

Install the `@zk-kit/lazytower.sol` package with npm:

```bash
npm i @zk-kit/lazytower.sol --save
```

or yarn:

```bash
yarn add @zk-kit/lazytower.sol
```

## 📜 Usage

### Importing and using the library

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../LazyTowerHashChain.sol";

contract LazyTowerHashChainTest {
    using LazyTowerHashChain for LazyTowerHashChainData;

    event Add(uint256 item);

    // map for multiple test cases
    mapping(bytes32 => LazyTowerHashChainData) public towers;

    function add(bytes32 _towerId, uint256 _item) external {
        towers[_towerId].add(_item);
        emit Add(_item);
    }

    function getDataForProving(bytes32 _towerId) external view returns (uint256, uint256[] memory, uint256) {
        return towers[_towerId].getDataForProving();
    }
}
```

### Creating an Hardhat task to deploy the contract

```typescript
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:lazytower-test", "Deploy a LazyTowerHashChainTest contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
        const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
        const PoseidonT3 = await PoseidonT3Factory.deploy()

        if (logs) {
            console.info(`PoseidonT3 library has been deployed to: ${PoseidonT3.address}`)
        }

        const LazyTowerLibFactory = await ethers.getContractFactory("LazyTowerHashChain", {
            libraries: {
                PoseidonT3: PoseidonT3.address
            }
        })
        const lazyTowerLib = await LazyTowerLibFactory.deploy()

        await lazyTowerLib.deployed()

        if (logs) {
            console.info(`LazyTowerHashChain library has been deployed to: ${lazyTowerLib.address}`)
        }

        const ContractFactory = await ethers.getContractFactory("LazyTowerHashChainTest", {
            libraries: {
                LazyTowerHashChain: lazyTowerLib.address
            }
        })

        const contract = await ContractFactory.deploy()

        await contract.deployed()

        if (logs) {
            console.info(`Test contract has been deployed to: ${contract.address}`)
        }

        return contract
    })
```

## Contacts

### Developers

-   e-mail : lcamel@gmail.com
-   github : [@LCamel](https://github.com/LCamel)
-   website : https://www.facebook.com/LCamel
