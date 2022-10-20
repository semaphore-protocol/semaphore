#!/usr/bin/bash

mkdir -p packages/semaphore/typechain
diff_result=$(diff -r -q build/typechain packages/semaphore/typechain);

if [ -z "$diff_result" ];
then
    echo 'Typechain files are the same'
else 
    rm -rf packages/semaphore/typechain;
    cp -r build/typechain packages/semaphore/typechain
fi

mkdir -p packages/proof/snark-artifacts
diff_result=$(diff -r -q fixtures/20/2 packages/proof/snark-artifacts);
if [ -z "$diff_result" ];
then
    echo 'Snark artifacts are the same'
else 
    rm -rf packages/proof/snark-artifacts;
    cp -r fixtures/20/2 packages/proof/snark-artifacts
fi
