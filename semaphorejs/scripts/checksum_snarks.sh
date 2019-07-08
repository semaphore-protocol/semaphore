#!/bin/bash -ex

cd ..
mkdir -p build
find snark -type f -exec md5sum {} \; | sort -k 2 | md5sum > ./build/.snark_checksum
echo './build/.snark_checksum:'
cat ./build/.snark_checksum
