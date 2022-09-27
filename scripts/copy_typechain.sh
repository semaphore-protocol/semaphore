#!/usr/bin/bash

diff_result=$(diff -r -q build/typechain packages/semaphore/typechain);

if [ -z "$diff_result" ];
then
    echo 'Files are the same'
else 
    rm -rf packages/semaphore/typechain;
    cp -r build/typechain packages/semaphore/typechain
fi
