#!/bin/bash -e

cp ../../build/circuit.json .
cp ../../build/contracts/Semaphore.json .
cp ../../build/proving_key.json .
cp ../../build/proving_key.bin .
cp ../../build/verification_key.json .
cp ../../build/contracts/Semaphore.json .
cp ../client/semaphore.js .
cp ../../node_modules/websnark/build/* .

webpack

cp circuit.json dist
cp proving_key.bin dist
cp verification_key.json dist
