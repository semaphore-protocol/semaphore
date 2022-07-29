#!/bin/bash

pathToCircuitDir=./build/circuit_artifacts
outdir=./build/circuit_artifacts/artifacts

circom --r1cs --wasm --sym -o ./build/circuit_artifacts ./circuits/semaphore.circom

echo "Setting up Phase 2 ceremony for semaphore"
echo "Outputting circuit_final.zkey and verifier.sol to $outdir"

npx snarkjs groth16 setup "$pathToCircuitDir/semaphore.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_0000.zkey"
echo "test" | npx snarkjs zkey contribute "$outdir/circuit_0000.zkey" "$outdir/circuit_0001.zkey" --name"1st Contributor name" -v
npx snarkjs zkey verify "$pathToCircuitDir/semaphore.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_0001.zkey"
npx snarkjs zkey beacon "$outdir/circuit_0001.zkey" "$outdir/circuit_final.zkey" 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
npx snarkjs zkey verify "$pathToCircuitDir/semaphore.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_final.zkey"
npx snarkjs zkey export verificationkey "$outdir/circuit_final.zkey" "$outdir/verification_key.json"  

npx snarkjs zkey export solidityverifier "$outdir/circuit_final.zkey" $outdir/verifier.sol
echo "Done!\n"

