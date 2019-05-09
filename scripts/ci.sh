#!/bin/bash -xe

echo "Working directory: `pwd`"
./compile.sh
# ./do_setup.sh
# ./build_verifier.sh
../node_modules/.bin/ganache-cli -p 7545 -l 8800000 -i 5777 &
npx mocha --recursive ../test
truffle migrate --reset
