#!/bin/bash -xe

cd "$(dirname "$0")"
cd ..

npm run ganache &
sleep 3 &&
npm run test-semaphore &&
sleep 1 &&
npm run test-mt
