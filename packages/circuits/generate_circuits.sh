#!/bin/bash

# Create the "compiled" directory if it doesn't exist
mkdir -p compiled


# Loop from 1 to 10
for i in {1..10}; do

  awk -v i="$i" '{ if ($0 ~ /global LEVELS: Field = [0-9]+;/) $0 = "global LEVELS: Field = " i ";"; print }' src/main.nr > tmp.nr && mv tmp.nr src/main.nr

  cp ./src/main.nr ./compiled/depth_$i.nr

  # Run nargo compile
  nargo compile

  # Assuming the generated file is always named main.json and is located in ./target
  # Copy the generated file to the "compiled" directory with a unique name for each iteration
  cp ./target/circuits.json ./compiled/depth_$i.json
done
