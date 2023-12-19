---
sidebar_position: 2
---

# Quick setup

Set up a new Hardhat project with Semaphore.
Learn how to create and test an Ethereum smart contract that uses zero-knowledge
proofs to verify membership.

To check out the code used in this guide, visit the
[quick-setup](https://github.com/semaphore-protocol/quick-setup) repository.

1. [**Create a Node.js project**](#create-a-nodejs-project)
2. [**Install Hardhat**](#install-hardhat)
3. [**Install Semaphore packages**](#install-semaphore-packages)
4. [**Create the Semaphore contract**](#create-the-semaphore-contract)
5. [**Create a Hardhat task**](#create-a-hardhat-task)
6. [**Test your contracts**](#test-your-contract)
7. [**Deploy your contract**](#deploy-your-contract)

## Create a Node.js project

1. Follow the [Node.js _LTS version_](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
   instructions to install `node` (Hardhat may not work with Node.js _Current_).

2. Follow the [Yarn](https://yarnpkg.com/getting-started/install) instructions
   to download and install the `yarn` package manager.

3. Create a directory for the project and change to the new directory.

    ```bash
    mkdir semaphore-example
    cd semaphore-example
    ```

4. In your terminal, run `yarn init` to initialize the Node.js project.

## Install Hardhat

[Hardhat](https://hardhat.org/) is a development environment you can use to
compile, deploy, test, and debug Ethereum software.
Hardhat includes the Hardhat Network, a local Ethereum network for development.

1. Use `yarn` to install [Hardhat](https://hardhat.org/getting-started/):

    ```bash
    yarn add hardhat --dev
    ```

2. Use `yarn` to run `hardhat` and create a JavaScript project:

    ```bash
    yarn hardhat
    # At the prompt, select "Create a JavaScript project"
    # and then enter through the prompts.
    ```

## Install Semaphore packages

Semaphore provides contracts, JavaScript libraries and a Hardhat plugin for developers building zero-knowledge applications.

-   `@semaphore-protocol/contracts` provides contracts to manage groups and verify Semaphore proofs on-chain.
-   JavaScript libraries help developers build zero-knowledge applications.
-   `@semaphore-protocol/hardhat` allows developers Hardhat tasks to deploy verifiers and Semaphore contracts.

To install these dependencies for your project, do the following:

1. Use `yarn` to install `@semaphore-protocol/contracts`:

    ```bash
    yarn add @semaphore-protocol/contracts@2.6.1
    ```

2. Use `yarn` to install the Semaphore JavaScript libraries and the Hardhat plugin:

    ```bash
    yarn add @semaphore-protocol/identity@2.6.1 @semaphore-protocol/group@2.6.1 @semaphore-protocol/proof@2.6.1 @semaphore-protocol/hardhat@0.1.0 --dev
    ```

For more detail about _Semaphore contracts_, see [Contracts](https://semaphore.pse.dev/docs/technical-reference/contracts).
To view the source of our packages, see the [semaphore](https://github.com/semaphore-protocol/semaphore/tree/v2.6.1#-packages) repository.

## Create the Semaphore contract

Create a `Greeter` contract that uses the `Semaphore.sol` contract:

1. Rename `Lock.sol` to `Greeter.sol` and replace the content with the following:

    ```solidity title="./contracts/Greeter.sol"
    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

    /// @title Greeter contract.
    /// @dev The following code is just an example to show how Semaphore can be used.
    contract Greeter  {
        event NewGreeting(bytes32 greeting);
        event NewUser(uint256 identityCommitment, bytes32 username);

        ISemaphore public semaphore;

        uint256 groupId;
        mapping(uint256 => bytes32) users;

        constructor(address semaphoreAddress, uint256 _groupId) {
            semaphore = ISemaphore(semaphoreAddress);
            groupId = _groupId;

            semaphore.createGroup(groupId, 20, 0, address(this));
        }

        function joinGroup(uint256 identityCommitment, bytes32 username) external {
            semaphore.addMember(groupId, identityCommitment);

            users[identityCommitment] = username;

            emit NewUser(identityCommitment, username);
        }

        function greet(
            bytes32 greeting,
            uint256 merkleTreeRoot,
            uint256 nullifierHash,
            uint256[8] calldata proof
        ) external {
            semaphore.verifyProof(groupId, merkleTreeRoot, greeting, nullifierHash, groupId, proof);

            emit NewGreeting(greeting);
        }
    }
    ```

## Create a Hardhat task

Hardhat lets you write [tasks](https://hardhat.org/guides/create-task.html#creating-a-task)
that automate building and deploying smart contracts and dApps.
To create a task that deploys the `Greeter` contract, do the following:

1. Create a `tasks` folder and add a `./tasks/deploy.js` file that contains the following:

    ```javascript title="./tasks/deploy.js"
    const { task, types } = require("hardhat/config")

    task("deploy", "Deploy a Greeter contract")
        .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.address)
        .addParam("group", "Group identifier", 42, types.int)
        .addOptionalParam("logs", "Print the logs", true, types.boolean)
        .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
            if (!semaphoreAddress) {
                const { address: verifierAddress } = await run("deploy:verifier", { logs, merkleTreeDepth: 20 })

                const { address } = await run("deploy:semaphore", {
                    logs,
                    verifiers: [
                        {
                            merkleTreeDepth: 20,
                            contractAddress: verifierAddress
                        }
                    ]
                })

                semaphoreAddress = address
            }

            const Greeter = await ethers.getContractFactory("Greeter")

            const greeter = await Greeter.deploy(semaphoreAddress, groupId)

            await greeter.deployed()

            if (logs) {
                console.log(`Greeter contract has been deployed to: ${greeter.address}`)
            }

            return greeter
        })
    ```

2. In your `hardhat.config.js` file, add the following:

    ```javascript title="./hardhat.config.js"
    require("@nomiclabs/hardhat-waffle")
    require("@semaphore-protocol/hardhat")
    require("./tasks/deploy") // Your deploy task.

    module.exports = {
        solidity: "0.8.4"
    }
    ```

## Test your contract

[`hardhat-waffle`](https://hardhat.org/plugins/nomiclabs-hardhat-waffle.html)
lets you write tests with the [Waffle](https://getwaffle.io/) test framework
and [Chai assertions](https://www.chaijs.com/).

1. Use `yarn` to install the `hardhat-waffle` plugin and dependencies for smart
   contract tests:

    ```bash
    yarn add -D @nomiclabs/hardhat-waffle 'ethereum-waffle@^3.0.0' \
       @nomiclabs/hardhat-ethers 'ethers@^5.0.0' chai
    ```

2. Download the Semaphore [zk trusted setup files](http://www.trusted-setup-pse.org/)
   and copy them to the `./static` folder.

    ```bash
    cd static
    wget http://www.trusted-setup-pse.org/semaphore/20/semaphore.zkey
    wget http://www.trusted-setup-pse.org/semaphore/20/semaphore.wasm
    ```

    Learn more about [trusted setup files](/docs/glossary/#trusted-setup-files).

3. Rename the `Lock.js` test file to `Greeter.js` and replace the content with the following:

    ```javascript title="./test/Greeter.js"
    const { Identity } = require("@semaphore-protocol/identity")
    const { Group } = require("@semaphore-protocol/group")
    const { generateProof, packToSolidityProof, verifyProof } = require("@semaphore-protocol/proof")
    const { expect } = require("chai")
    const { run, ethers } = require("hardhat")

    describe("Greeter", function () {
        let greeter

        const users = []
        const groupId = 42
        const group = new Group()

        before(async () => {
            greeter = await run("deploy", { logs: false, group: groupId })

            users.push({
                identity: new Identity(),
                username: ethers.utils.formatBytes32String("anon1")
            })

            users.push({
                identity: new Identity(),
                username: ethers.utils.formatBytes32String("anon2")
            })

            group.addMember(users[0].identity.generateCommitment())
            group.addMember(users[1].identity.generateCommitment())
        })

        describe("# joinGroup", () => {
            it("Should allow users to join the group", async () => {
                for (let i = 0; i < group.members.length; i++) {
                    const transaction = greeter.joinGroup(group.members[i], users[i].username)

                    await expect(transaction).to.emit(greeter, "NewUser").withArgs(group.members[i], users[i].username)
                }
            })
        })

        describe("# greet", () => {
            const wasmFilePath = "./static/semaphore.wasm"
            const zkeyFilePath = "./static/semaphore.zkey"

            it("Should allow users to greet", async () => {
                const greeting = ethers.utils.formatBytes32String("Hello World")

                const fullProof = await generateProof(users[1].identity, group, groupId, greeting, {
                    wasmFilePath,
                    zkeyFilePath
                })
                const solidityProof = packToSolidityProof(fullProof.proof)

                const transaction = greeter.greet(
                    greeting,
                    fullProof.publicSignals.merkleRoot,
                    fullProof.publicSignals.nullifierHash,
                    solidityProof
                )

                await expect(transaction).to.emit(greeter, "NewGreeting").withArgs(greeting)
            })
        })
    })
    ```

4. Run the following `yarn` commands to compile and test your contract:

    ```bash
    yarn hardhat compile
    yarn hardhat test
    ```

## Deploy your contract

To deploy your contract in a local Hardhat network (and use it in your dApp), run the following `yarn` commands:

```bash
yarn hardhat node
yarn hardhat deploy --group 42 --network localhost # In another tab.
```

For a more complete demo that provides a starting point for your dApp,
see [semaphore-boilerplate](https://github.com/semaphore-protocol/boilerplate/).
