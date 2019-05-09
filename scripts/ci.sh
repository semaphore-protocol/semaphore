#!/bin/bash -xe

./compile.sh
# ./do_setup.sh
# ./build_verifier.sh
npx mocha ../test/whole.js
