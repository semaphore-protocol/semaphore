#!/bin/bash -xe

echo "Working directory: `pwd`"
./compile.sh
# ./do_setup.sh
# ./build_verifier.sh
npx mocha --recursive ../test
../node_modules/.bin/ganache-cli -p 7545 -l 8800000 -i 5777 &
../node_modules/.bin/truffle migrate --reset
