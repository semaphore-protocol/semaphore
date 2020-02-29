#!/bin/bash

# Used by the CircleCI process to generate a checksum of the snark files so
# that it can cache them.

cd "$(dirname "$0")"
mkdir -p ../build
cd ../build

find ../circom -type f -exec md5sum {} \; | sort -k 2 | md5sum > ./.snark_checksum
echo 'snark checksum:'
cat .snark_checksum
