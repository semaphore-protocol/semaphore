---
sidebar_position: 2
---

# Quick setup

The following setup will allow you to create a simple Hardhat project with Semaphore (contract and tests). If you need a more complete demo try [semaphore-boilerplate](https://github.com/cedoor/semaphore-boilerplate/). It can be a good starting point to create your DApp.

:::info
Visit the [semaphore-quick-setup](https://github.com/cedoor/semaphore-quick-setup) repository to get a full view of the code used below.
:::

## Create a Node.js project

1. Download and install [Node.js/NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Yarn](https://yarnpkg.com/getting-started/install).
2. Create your project:

```bash
$ mkdir semaphore-example
$ cd semaphore-example
$ yarn init
```

## Install Hardhat and the Semaphore packages

1. Install [Hardhat](https://hardhat.org/getting-started/) and create a basic sample project:

```bash
$ yarn add hardhat --dev
$ yarn hardhat # Create a basic sample project and confirm the other requests.
```

:::tip
Feel free to create more complex sample projects if you are an advanced Hardhat user.
:::

2. Install the [Semaphore contracts](technical-reference/contracts) and its [ZK-kit libraries](technical-reference/zk-kit):

```bash
$ yarn add @appliedzkp/semaphore-contracts
$ yarn add @zk-kit/identity @zk-kit/protocols --dev
```

## Create your contract

Rename `Greeter.sol` to `Greeters.sol` and insert the following code:

```solidity title="./semaphore-example/contracts/Greeters.sol"
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@appliedzkp/semaphore-contracts/interfaces/IVerifier.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreCore.sol";

/// @title Greeters contract.
/// @dev The following code is just a example to show how Semaphore con be used.
contract Greeters is SemaphoreCore {
  // A new greeting is published every time a user's proof is validated.
  event NewGreeting(bytes32 greeting);

  // Greeters are identified by a Merkle root.
  // The offchain Merkle tree contains the greeters' identity commitments.
  uint256 public greeters;

  // The external verifier used to verify Semaphore proofs.
  IVerifier public verifier;

  constructor(uint256 _greeters, address _verifier) {
    greeters = _greeters;
    verifier = IVerifier(_verifier);
  }

  // Only users who create valid proofs can greet.
  // The external nullifier is in this example the root of the Merkle tree.
  function greet(
    bytes32 _greeting,
    uint256 _nullifierHash,
    uint256[8] calldata _proof
  ) external {
    require(
      _isValidProof(_greeting, greeters, _nullifierHash, greeters, _proof, verifier),
      "Greeters: the proof is not valid"
    );

    // Prevent double-greeting (nullifierHash = hash(root + identityNullifier)).
    // Every user can greet once.
    _saveNullifierHash(_nullifierHash);

    emit NewGreeting(_greeting);
  }
}

```

## Create some identity commitments

Identity commitments are used as the leaves of the Merkle trees used in the protocol and represent the identity of the users. Create a `static` folder and add the following file:

```json title="./static/identityCommitments.json"
[
  "9426253249246138013650573474062059446203468399013007463704855436559640562175",
  "6200634377081441056179822649025268043304989981899916286941956069781421654881",
  "19706772421195815860043593475869058320994241404138740034486179990871964981523"
]
```

:::info
The previous identity commitments have been generated using `@zk-kit/identity` (with a message strategy) and Metamask for signing the messages with the first 3 Ethereum accounts of the [Hardhat dev wallet](https://hardhat.org/hardhat-network/reference/#accounts).
:::

## Create a [Hardhat task](https://hardhat.org/guides/create-task.html#creating-a-task) to deploy your contract

1. Install `@zk-kit/incremental-merkle-tree` and `circomlibjs@0.0.8` to create offchain Merkle trees.

```bash
$ yarn add @zk-kit/incremental-merkle-tree circomlibjs@0.0.8 --dev
```

2. Install `hardhat-dependency-compiler` to deploy a local verifier.

```bash
$ yarn add hardhat-dependency-compiler --dev
```

3. Create a `tasks` folder and add the following file:

```javascript title="./tasks/deploy.js"
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree")
const { poseidon } = require("circomlibjs")
const identityCommitments = require("../static/identityCommitments.json")
const { task, types } = require("hardhat/config")

task("deploy", "Deploy a Greeters contract")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }) => {
    const VerifierContract = await ethers.getContractFactory("Verifier")
    const verifier = await VerifierContract.deploy()

    await verifier.deployed()

    logs && console.log(`Verifier contract has been deployed to: ${verifier.address}`)

    const GreetersContract = await ethers.getContractFactory("Greeters")

    const tree = new IncrementalMerkleTree(poseidon, 20, BigInt(0), 2)

    for (const identityCommitment of identityCommitments) {
      tree.insert(identityCommitment)
    }

    const greeters = await GreetersContract.deploy(tree.root, verifier.address)

    await greeters.deployed()

    logs && console.log(`Greeters contract has been deployed to: ${greeters.address}`)

    return greeters
  })
```

4. Set up your `hardhat.config.js` file:

```javascript title="./hardhat.config.js"
require("@nomiclabs/hardhat-waffle")
require("hardhat-dependency-compiler")
require("./tasks/deploy") // Your deploy task.

module.exports = {
  solidity: "0.8.4",
  dependencyCompiler: {
    // It allows Hardhat to compile the external Verifier.sol contract.
    paths: ["@appliedzkp/semaphore-contracts/base/Verifier.sol"]
  }
}
```

## Create your tests

1. Creating proofs requires some static files, in the future these files will be hosted on a server and made public. For now you can use the ones used in [our repository](https://github.com/appliedzkp/semaphore/tree/main/build/snark) for testing. Copy these files in the `static` folder.

2. Update the Hardhat test file:

```javascript title="./test/sample-test.js"
const { Strategy, ZkIdentity } = require("@zk-kit/identity")
const { generateMerkleProof, Semaphore } = require("@zk-kit/protocols")
const identityCommitments = require("../static/identityCommitments.json")
const { expect } = require("chai")
const { run, ethers } = require("hardhat")

describe("Greeters", function () {
  let contract
  let signers

  before(async () => {
    contract = await run("deploy", { logs: false })

    signers = await ethers.getSigners()
  })

  describe("# greet", () => {
    const wasmFilePath = "./static/semaphore.wasm"
    const finalZkeyPath = "./static/semaphore_final.zkey"

    it("Should greet", async () => {
      const message = await signers[0].signMessage("Sign this message to create your identity!")

      const identity = new ZkIdentity(Strategy.MESSAGE, message)
      const identityCommitment = identity.genIdentityCommitment()
      const greeting = "Hello world"
      const bytes32Greeting = ethers.utils.formatBytes32String(greeting)

      const merkleProof = generateMerkleProof(20, BigInt(0), 2, identityCommitments, identityCommitment)
      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        merkleProof.root,
        greeting
      )

      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof.proof)

      const nullifierHash = Semaphore.genNullifierHash(merkleProof.root, identity.getNullifier())

      const transaction = contract.greet(bytes32Greeting, nullifierHash, solidityProof)

      await expect(transaction).to.emit(contract, "NewGreeting").withArgs(bytes32Greeting)
    })
  })
})
```

3. Compile and test your contract:

```bash
$ yarn hardhat compile
$ yarn hardhat test
```

## Deploy your contract in a local network

You can also deploy your contract in a local Hardhat network and use it in your DApp:

```bash
$ yarn hardhat node
$ yarn hardhat deploy --network localhost # In another tab.
```
