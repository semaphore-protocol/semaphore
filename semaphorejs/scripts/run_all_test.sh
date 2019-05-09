#!/bin/bash -xe

rm -rf semaphore_server.db

truffle migrate --reset
ADDRESS=`cat ../build/contracts/Semaphore.json | jq '.networks."5777".address' | sed 's/"//g'`

CHAIN_ID=5777 CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=http://localhost:7545 EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 node ../src/client/client.js generate_identity

IDENTITY_COMMITMENT=`cat ./semaphore_identity.json | jq '.identity_commitment' | sed 's/"//g'`

tmux \
    new-session "source ~/.zshrc; LOG_LEVEL=verbose CHAIN_ID=5777 CONTRACT_ADDRESS=$ADDRESS NODE_URL=http://127.0.0.1:7545 SEMAPHORE_PORT=3000 FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 TRANSACTION_CONFIRMATION_BLOCKS=1 node ../src/server/server.js; bash -i" \; \
    split-window -h -t 0 "source ~/.zshrc; sleep 3; LOG_LEVEL=verbose curl http://localhost:3000/add_identity -X POST -d'{\"leaf\": \"${IDENTITY_COMMITMENT}\"}' -H 'Content-Type: application/json'; bash -i" \; \
    split-window -t 0 "source ~/.zshrc; sleep 3; ./wait_for_element.sh ${IDENTITY_COMMITMENT}; LOG_LEVEL=verbose TRANSACTION_CONFIRMATION_BLOCKS=1 CHAIN_ID=5777 CONTRACT_ADDRESS=$ADDRESS FROM_ADDRESS=0x1929c15f4e818abf2549510622a50c440c474223 FROM_PRIVATE_KEY=0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21 NODE_URL=http://localhost:7545 EXTERNAL_NULLIFIER=12312 SEMAPHORE_SERVER_URL=http://localhost:3000 node ../src/client/client.js signal lol; bash -i"
