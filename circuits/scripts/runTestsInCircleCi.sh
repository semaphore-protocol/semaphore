#!/bin/bash -xe

cd "$(dirname "$0")"
cd ..

npm run test-blake2s
