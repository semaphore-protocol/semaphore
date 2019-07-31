#!/bin/bash -xe
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
#

rm -rf semaphore_server.db

export CHAIN_ID=5777
export NODE_URL=http://localhost:7545
export SERVER_NODE_URL=http://localhost:7545
export DEPLOY_TO=local
export SLEEP_TIME=7

if [ "$1" == "goerli" ]; then
  CHAIN_ID=5
  NODE_URL=https://goerli.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=https://goerli.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  DEPLOY_TO=goerli
  SLEEP_TIME=20
fi
if [ "$1" == "ropsten" ]; then
  CHAIN_ID=3
  NODE_URL=https://ropsten.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=https://ropsten.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  DEPLOY_TO=ropsten
  SLEEP_TIME=20
fi

if [ "$1" == "rinkeby" ]; then
  CHAIN_ID=4
  NODE_URL=https://rinkeby.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=https://rinkeby.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  DEPLOY_TO=rinkeby
  SLEEP_TIME=20
fi

LOG_LEVEL=$2 || "verbose"

if [ "$3" == "true" ]; then
  truffle migrate --network ${DEPLOY_TO} -f 2 --to 2
  truffle migrate --network ${DEPLOY_TO} -f 4 --to 4
fi

ADDRESS=`cat ../build/contracts/Semaphore.json | jq ".networks.\"${CHAIN_ID}\".address" | sed 's/"//g'`
CREATION_HASH=`cat ../build/contracts/Semaphore.json | jq ".networks.\"${CHAIN_ID}\".transactionHash" | sed 's/"//g'`

CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=${NODE_URL} EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 CONFIG_ENV=true BASE_DIR=../.. npx semaphorejs-client generate_identity

IDENTITY_COMMITMENT=`cat ./semaphore_identity.json | jq '.identity_commitment' | sed 's/"//g'`
echo ${IDENTITY_COMMITMENT}

tmux \
    new-session "source ~/.bashrc; export CONFIG_ENV=true LOG_LEVEL=${LOG_LEVEL} CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS NODE_URL=${SERVER_NODE_URL} SEMAPHORE_PORT=3000 FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 TRANSACTION_CONFIRMATION_BLOCKS=1 CREATION_HASH=${CREATION_HASH}; npx semaphorejs-server disable_permissioning; npx semaphorejs-server; bash -i" \; \
    split-window -h -t 0 "source ~/.bashrc; sleep ${SLEEP_TIME}; LOG_LEVEL=${LOG_LEVEL} curl http://localhost:3000/add_identity -X POST -d'{\"leaf\": \"${IDENTITY_COMMITMENT}\"}' -H 'Content-Type: application/json'; bash -i" \; \
    split-window -t 0 "source ~/.bashrc; sleep ${SLEEP_TIME}; ./wait_for_element.sh ${IDENTITY_COMMITMENT}; LOG_LEVEL=${LOG_LEVEL} TRANSACTION_CONFIRMATION_BLOCKS=1 CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=${NODE_URL} EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 BROADCASTER_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 CONFIG_ENV=true BASE_DIR=`pwd`/.. npx semaphorejs-client signal `shuf -i 1-100000000 -n 1`; bash -i"
