#!/bin/bash -xe

rm -rf semaphore_server.db

export CHAIN_ID=5777
export NODE_URL=http://localhost:7545
export DEPLOY_TO=local

if [ "$1" == "goerli" ]; then
  CHAIN_ID=5
  NODE_URL=https://goerli.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=http://localhost:8545
  DEPLOY_TO=goerli
fi

if [ "$1" == "ropsten" ]; then
  CHAIN_ID=3
  NODE_URL=https://ropsten.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=http://localhost:8545
  DEPLOY_TO=ropsten
fi

if [ "$1" == "rinkeby" ]; then
  CHAIN_ID=4
  NODE_URL=https://rinkeby.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  SERVER_NODE_URL=https://rinkeby.infura.io/v3/f4a3ad81db3f4750bd201955c8d20066
  DEPLOY_TO=rinkeby
fi

LOG_LEVEL=$2 || "verbose"

if [ "$3" == "true" ]; then
  truffle migrate --network ${DEPLOY_TO} -f 2 --to 2
  truffle migrate --network ${DEPLOY_TO} -f 4 --to 4
fi

ADDRESS=`cat ../build/contracts/Semaphore.json | jq ".networks.\"${CHAIN_ID}\".address" | sed 's/"//g'`
CREATION_HASH=`cat ../build/contracts/Semaphore.json | jq ".networks.\"${CHAIN_ID}\".transactionHash" | sed 's/"//g'`

CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=${NODE_URL} EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 node ../src/client/client.js generate_identity

IDENTITY_COMMITMENT=`cat ./semaphore_identity.json | jq '.identity_commitment' | sed 's/"//g'`

tmux \
    new-session "source ~/.zshrc; LOG_LEVEL=${LOG_LEVEL} CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS NODE_URL=${SERVER_NODE_URL} SEMAPHORE_PORT=3000 FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 TRANSACTION_CONFIRMATION_BLOCKS=1 CREATION_HASH=${CREATION_HASH} node ../src/server/server.js; bash -i" \; \
    split-window -h -t 0 "source ~/.zshrc; sleep 3; LOG_LEVEL=${LOG_LEVEL} curl http://localhost:3000/add_identity -X POST -d'{\"leaf\": \"${IDENTITY_COMMITMENT}\"}' -H 'Content-Type: application/json'; bash -i" \; \
    split-window -t 0 "source ~/.zshrc; sleep 3; ./wait_for_element.sh ${IDENTITY_COMMITMENT}; LOG_LEVEL=${LOG_LEVEL} TRANSACTION_CONFIRMATION_BLOCKS=1 CHAIN_ID=${CHAIN_ID} CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=${NODE_URL} EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 node ../src/client/client.js signal lol; bash -i"
