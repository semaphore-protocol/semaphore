# Semaphore

[![CircleCI](https://circleci.com/gh/kobigurk/semaphore.svg?style=svg)](https://circleci.com/gh/kobigurk/semaphore)

## Introduction

Semaphore has been introduced by [barryWhiteHat](https://github.com/barryWhiteHat) as a method of zero-knowledge signaling. This repository is an implementation of the concept, including the zero-knowledge circuits and the tools necessary to use it, both server-side and client-side.

Read the work-in-progress spec [here](https://hackmd.io/URAiVCeiTpGO-MpPrG3amg).

The project is implemented in Node.JS and uses [circom](https://github.com/iden3/circom) for the zero-knowledge proofs.

## Repository structure

* [**sbmtjs**](sbmtjs) - *storage-backed merkle tree*. Semaphore requires managing a growing merkle tree containing the identities allowed to signal. sbmtjs manages the tree using a database, making the tree scale by the disk size.
* [**semaphorejs**](semaphorejs) - server, client, smart contract and circuit implementation of Semaphore.
    * [**src/server/server.js**](semaphorejs/src/server.js) - acts as a manager of the identities merkle tree and as an identity onboarder. The REST API allows:
        * An onboarder to submit a transaction that adds an identity to the merkle tree, provided proper authentication.
        * A client to ask for a path from an identity commitment to the current root of the tree, relieving the client from the need to manage this tree by themselves.
    The server relies on the smart contract to synchronize to the current state and handle rollbacks if they occur.
    * [**src/client/client.js**](semaphorejs/src/client.js) - enables signalling their support of an arbitrary statemnt, given identity secrets of an identity existing in the tree. The client has 2 CLI functions:
      * **generate_identity** - generate random identity secrets and randomness, save them to disk and print the identity commitment. The client can then send the commitment to the onboarder (using another channel), requesting they add them to the tree.
      * **signal STRING** - given an arbitrary string, generates a zero-knowledge proof of the client's authorization to signal. The signalling requests the path of the identity commitment from the server, and broadcasts the transaction directly to the contract.
    * [**contracts**](semaphorejs/contracts):
      * [**Semaphore.sol**](semaphorejs/contracts/Semaphore.sol):
        * Semaphore's main contract, implementing onboarding and signalling. Onboarding verifies the creator of the contract is the one adding identities. Signalling verifies a zero-knowledge proof, some other conditions and updates the state of Semaphore, consisting of a merkle root and a signal rolling hash. The contract also includes an *external_nullifier*, which is a mechanism for detecting multiple signals from the same identity.
      * [**MerkleTree.sol**](semaphorejs/contracts/MerkleTree.sol):
        * An append-only merkle tree, allowing efficient inserts without race conditions. Additionally, it allows updates. 
    * [**snark**](semaphorejs/snark):
      * [**semaphore.circom**](semaphorejs/snark/semaphore.circom): implements the circuit as defined in the spec. Two main components are worth noting here as well:
        * **nullifiers_hash** - this is derived from the *external_nullifier* set in the contract and the *nullifier* which is part of the identity. It is the same for each signal of the identity, allowing the detection of multiple signals by the same identity.
        * **EdDSA signature** - an input of the zero-knowledge proof is a signature. This opens up the possibility of involving a hardware wallet for better security.

## Running

* The easiest way to try Semaphore out is running:
  * **scripts/run_ganache.sh** - runs ganache with appropriate parameters for Semaphroe testing.
  * **scripts/run_all_test.sh** - runs a server and a client, generates a new random identity and broadcasts a signal.

It assumes zsh, node and truffle are globally available.

The server and the client accept most of their configuration as environment variables:
* **server**:
    * LOG_LEVEL - error, info, debug or verbose.
    * CHAIN_ID - chain ID of the Ethereum network.
    * CONTRACT_ADDRESS - the deployed Semaphore contract address.
    * NODE_URL - the RPC URL of the Ehtereum node.
    * SEMAPHORE_PORT - the port on which to serve the Semaphore server REST API.
    * FROM_ADDRESS - the address to send transactions from.
    * FROM_PRIVATE_KEY - the private key of FROM_ADDRESS.
    * TRANSACTION_CONFIRMATION_BLOCKS - the amount of blocks to wait until a transaction is considered confirmed. The default is 24.
* **client:**
    * LOG_LEVEL - error, info, debug or verbose.
    * CHAIN_ID - chain ID of the Ethereum network.
    * CONTRACT_ADDRESS - the deployed Semaphore contract address.
    * NODE_URL - the RPC URL of the Ehtereum node.
    * FROM_ADDRESS - the address to send transactions from.
    * FROM_PRIVATE_KEY - the private key of FROM_ADDRESS.
    * TRANSACTION_CONFIRMATION_BLOCKS - the amount of blocks to wait until a transaction is considered confirmed. The default is 24.
    * EXTERNAL_NULLIFIER - the external nullifier to be used with the signal. Must match the one in the contract.
    * SEMAPHORE_SERVER_URL - the URL of the Semaphore RESET server.

Examples of run commands:
* LOG_LEVEL=verbose CHAIN_ID=5777 CONTRACT_ADDRESS=$ADDRESS NODE_URL=http://127.0.0.1:7545 SEMAPHORE_PORT=3000 FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 TRANSACTION_CONFIRMATION_BLOCKS=1 node src/server/server.js
* LOG_LEVEL=verbose TRANSACTION_CONFIRMATION_BLOCKS=1 CHAIN_ID=5777 CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=http://localhost:7545 EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 node ../src/client/client.js signal "I vote for fork A"