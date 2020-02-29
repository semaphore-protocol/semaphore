#!/bin/bash
#
# semaphorejs - Zero-knowledge signaling on Ethereum
# Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
#
# This file is part of semaphorejs.
#
# semaphorejs is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# semaphorejs is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.

cd "$(dirname "$0")"
mkdir -p ../build
cd ../build

if [ -f ./circuit.json ]; then
    echo "circuit.json already exists. Skipping."
else
    echo 'Generating circuit.json'
    export NODE_OPTIONS=--max-old-space-size=4096
    npx circom ../circom/semaphore.circom
fi

if [ -f ./proving_key.json ]; then
    echo "proving_key.json already exists. Skipping."
else
    echo 'Generating proving_key.json'
    export NODE_OPTIONS=--max-old-space-size=4096
    npx snarkjs setup --protocol groth
fi

if [ -f ./proving_key.bin ]; then
    echo 'proving_key.bin already exists. Skipping.'
else
    echo 'Generating proving_key.bin'
    export NODE_OPTIONS=--max-old-space-size=4096
    node ../node_modules/websnark/tools/buildpkey.js -i ./proving_key.json -o ./proving_key.bin
fi

if [ -f ./verifier.sol ]; then
    echo 'verifier.sol already exists. Skipping.'
else
    echo 'Generating verifier.sol'
    npx snarkjs generateverifier --vk ./verification_key.json -v ./verifier.sol
fi

# Copy verifier.sol to the contracts/sol directory
echo 'Copying verifier.sol to contracts/sol.'
cp ./verifier.sol ../../contracts/sol/
