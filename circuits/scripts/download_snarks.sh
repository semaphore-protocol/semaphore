#!/bin/bash

cd "$(dirname "$0")"

CIRCUIT_JSON="https://www.dropbox.com/s/5pdqaxl80cl4bkn/circuit.json?dl=1"
PROVING_KEY_BIN="https://www.dropbox.com/s/1221knka63bowio/proving_key.bin?dl=1"
VERIFICATION_KEY_JSON="https://www.dropbox.com/s/yi423k5mx3qgsb7/verification_key.json?dl=1"
VERIFIER_SOL="https://www.dropbox.com/s/ejxa3srnf02h6b4/verifier.sol?dl=1"

CIRCUIT_JSON_PATH="../build/circuit.json"
PROVING_KEY_BIN_PATH="../build/proving_key.bin"
VERIFICATION_KEY_PATH="../build/verification_key.json"
VERIFIER_SOL_PATH="../build/verifier.sol"

mkdir -p ../build

if [ ! -f "$CIRCUIT_JSON_PATH" ]; then
    echo "Downloading circuit.json"
    wget --quiet $CIRCUIT_JSON -O $CIRCUIT_JSON_PATH
fi

if [ ! -f "$PROVING_KEY_BIN_PATH" ]; then
    echo "Downloading proving_key.bin"
    wget --quiet $PROVING_KEY_BIN -O $PROVING_KEY_BIN_PATH
fi

if [ ! -f "$VERIFICATION_KEY_PATH" ]; then
    echo "Downloading verification_key.json"
    wget --quiet $VERIFICATION_KEY_JSON -O $VERIFICATION_KEY_PATH
fi

if [ ! -f "$VERIFIER_SOL_PATH" ]; then
    echo "Downloading verification_key.json"
    wget --quiet $VERIFIER_SOL -O $VERIFIER_SOL_PATH
fi
