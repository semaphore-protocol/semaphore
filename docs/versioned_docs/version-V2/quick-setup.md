---
sidebar_position: 2
---

# Quick setup

Setup a new Hardhat project with Semaphore.
Learn how to create and test an Ethereum smart contract that uses zero-knowledge proofs to verify membership.

To checkout the code used in this guide, visit the [semaphore-quick-setup](https://github.com/cedoor/semaphore-quick-setup) repository.

## Create a Node.js project

1. Follow the [Node.js _LTS version_](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
   instructions to install `node` (Hardhat may not work with Node.js _Current_).

2. Follow the [Yarn](https://yarnpkg.com/getting-started/install) instructions to download and install the `yarn` package manager.

3. Create a directory for the project and change to the new directory.

  ```sh
  mkdir semaphore-example
  cd semaphore-example
  ```

4. Run `yarn init` to initialize the Node.js project.

  ```sh
  yarn init
  ```

## Install Hardhat

[Hardhat](https://hardhat.org/) is a development environment you can use to compile, deploy, test, and debug Ethereum software.
It helps developers manage and automate tasks for building smart contracts and dApps.
Hardhat includes the Hardhat Network, a local Ethereum network for development.

Run the following `yarn` commands to install [Hardhat](https://hardhat.org/getting-started/) and create a _basic sample project_:

```sh
yarn add hardhat --dev
yarn hardhat
# At the prompt, select "Create a basic sample project"
# and then enter through the prompts.
```

## Install Semaphore contracts and ZK-kit

[`@appliedzkp/semaphore-contracts`](https://github.com/appliedzkp/semaphore/tree/main/contracts) provides a _base contract_ that verifies Semaphore proofs.
[`@zk-kit`](https://github.com/appliedzkp/zk-kit) provides JavaScript libraries that help developers build zero-knowledge applications.

Run the following `yarn` commands to install the `@appliedzkp/semaphore-contracts` and `@zk-kit` packages:

```sh
yarn add @appliedzkp/semaphore-contracts
yarn add @zk-kit/identity @zk-kit/protocols --dev
```

For more detail about _Semaphore base contracts_, see [Contracts](https://semaphore.appliedzkp.org/docs/technical-reference/contracts).

## Create the Semaphore contract

Create a `Greeters` contract that imports and extends the Semaphore base contract.

1. In `./contracts`, rename `Greeter.sol` to `Greeters.sol`.
2. Replace the contents of `Greeters.sol` with the following:

    ```solidity title="./semaphore-example/contracts/Greeters.sol"
    //SPDX-License-Identifier: MIT
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
            _verifyProof(_greeting, greeters, _nullifierHash, greeters, _proof, verifier);

            // Prevent double-greeting (nullifierHash = hash(root + identityNullifier)).
            // Every user can greet once.
            _saveNullifierHash(_nullifierHash);

            emit NewGreeting(_greeting);
        }
    }

    ```

## Create Semaphore IDs

Semaphore _identity commitments_ (Semaphore IDs) represent user identities and are the leaves of the Merkle trees in the protocol.

For this example, create a `./static` folder and add a `identityCommitments.json` file that contains the following array of test IDs:

```json title="./static/identityCommitments.json"
[
  "9426253249246138013650573474062059446203468399013007463704855436559640562175",
  "6200634377081441056179822649025268043304989981899916286941956069781421654881",
  "19706772421195815860043593475869058320994241404138740034486179990871964981523"
]
```

:::info
To generate these identity commitments, we used `@zk-kit/identity` (with a message strategy) and then signed the messages in Metamask with the first 3 Ethereum accounts of the [Hardhat dev wallet](https://hardhat.org/hardhat-network/reference/#accounts).
:::

## Create a [Hardhat task](https://hardhat.org/guides/create-task.html#creating-a-task) to deploy your contract

1. Install `@zk-kit/incremental-merkle-tree` and `circomlibjs@0.0.8` to create offchain Merkle trees.

  ```bash
  yarn add @zk-kit/incremental-merkle-tree circomlibjs@0.0.8 --dev
  ```

2. Install `hardhat-dependency-compiler` to deploy a local verifier.

  ```bash
  yarn add hardhat-dependency-compiler --dev
  ```

3. Create a `tasks` folder and add a `./tasks/deploy.js` file that contains the following:

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

4. Use `yarn` to install the `hardhat-waffle` plugin and dependencies for smart contract tests.
   [`hardhat-waffle`](https://hardhat.org/plugins/nomiclabs-hardhat-waffle.html)
   lets you write tests with the [Waffle](https://getwaffle.io/) test framework
   and [Chai assertions](https://www.chaijs.com/).

  ```bash
  yarn add -D @nomiclabs/hardhat-waffle 'ethereum-waffle@^3.0.0' \
              @nomiclabs/hardhat-ethers 'ethers@^5.0.0' chai
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

1. To create Zk proofs, you need the SNARK static files. Download the Semaphore [snark build files](https://github.com/appliedzkp/semaphore/tree/main/build/snark) and copy them to the `static` folder.

2. Replace the contents of `./test/sample-test.js` with the following test module:

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

              const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, identityCommitment)
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

3. Run the following `yarn` commands to compile and test your contract:

  ```bash
  yarn hardhat compile
  yarn hardhat test
  ```

## Deploy your contract in a local network

To deploy your contract in a local Hardhat network (and use it in your DApp), run the following `yarn` commands:

```bash
yarn hardhat node
yarn hardhat deploy --network localhost # In another tab.
```

For a more complete demo, see [semaphore-boilerplate](https://github.com/cedoor/semaphore-boilerplate/).
It can be a good starting point to create your DApp.
