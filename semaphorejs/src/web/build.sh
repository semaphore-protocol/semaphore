#!/bin/bash -e

cp ../../build/circuit.json .
cp ../../build/proving_key.json .
cp ../../build/contracts/Semaphore.json .
cp ../client/semaphore.js .
cp ../../node_modules/websnark/build/* .

webpack
