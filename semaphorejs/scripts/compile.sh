#!/bin/bash -ex

mkdir -p ../build
cd ../build

npx circom ../snark/semaphore.circom
