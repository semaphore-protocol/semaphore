#!/bin/bash -xe

./compile.sh
# ./do_setup.sh
# ./build_verifier.sh
npx mocha --recursive ../test
