#!/bin/bash -e

mkdir -p ../build
cd ../build

circom ../src/factor/circuit.circom
snarkjs setup
