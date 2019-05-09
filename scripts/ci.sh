#!/bin/bash -xe

./do_setup.sh
./build_verifier.sh
npx mocha test/whole.js
