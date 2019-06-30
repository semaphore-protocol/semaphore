#!/bin/bash -ex

cd ..
mkdir -p build
find snark/**/** -exec cat {} \; | md5sum > ./build/.snark_checksum
echo './build/.snark_checksum:'
cat ./build/.snark_checksum
