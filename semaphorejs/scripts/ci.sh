#!/bin/bash -xe

echo "Working directory: `pwd`"
./compile.sh
./do_setup.sh
./build_verifier.sh
npx mocha --recursive ../test/circuit
../node_modules/.bin/ganache-cli -p 7545 -l 8800000 -i 5777 --account='0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21,100000000000000000000000000' --account='0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21,10000000000000000000000000' -q &
../node_modules/.bin/truffle migrate --reset

