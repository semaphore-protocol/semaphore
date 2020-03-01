# Quick start

You should have Node 11.14.0 installed. Use
[`nvm`](https://github.com/nvm-sh/nvm) to install it.

Clone this repository, install dependencies, and build the source code:

```bash
git clone git@github.com:kobigurk/semaphore.git && \
cd semaphore && \
npm i && \
npm run bootstrap && \
npm run build
```

Next, either download the compiled zk-SNARK circuit, proving key, and
verification key (note that these keys are for testing purposes, and not for
production, as there is no certainty that the toxic waste was securely
discarded).

To download the circuit, proving key, and verification key, run:

```bash
# Start from the base directory

cd circuits && \
./circuits/scripts/download_snarks.sh
```

To generate the above files locally instead, run:

```bash
# Start from the base directory

cd circuits && \
./circuits/scripts/build_snarks.sh
```

This process should take about 45 minutes.

Build the Solidity contracts (you need `solc` v 0.5.12 installed in your `$PATH`):

```bash
# Start from the base directory

cd contracts && \
npm run compileSol
```

Run tests while still in the `contracts/` directory:

```bash
# The first command tests the Merkle tree contract and the second
# tests the Semaphore contract

npm run test-semaphore && \ 
npm run test-mt
```
