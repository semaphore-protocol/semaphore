#!/bin/bash -ex

mkdir -p ../build
cd ../build

npx circom ../snark/semaphore-test.circom -o circuit-test.json
npx circom ../snark/semaphore.circom
