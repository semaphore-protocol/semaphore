#!/bin/bash -ex

mkdir -p ../build
cd ../build

npx snarkjs generateverifier --vk ../build/verification_key.json -v ../build/verifier.sol
