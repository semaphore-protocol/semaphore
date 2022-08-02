#!/bin/bash
mkdir -p artifacts/circuits/;

outdir=artifacts/circuits
# pathToCircuitDir=artifacts/circuits
# pathToCircuitDir=./build/circuit_artifacts/artifacts

compile () {
    local outdir="$1" circuit="$2" maxEdges="$3"
    # mkdir -p "build/$outdir"
    mkdir -p "$outdir/$maxEdges"
    echo "Compiling circuit: circuits/$circuit.circom"
    ~/.cargo/bin/circom --r1cs --wasm --sym \
        -o "./$outdir/$maxEdges/" \
        "circuits/$circuit.circom"
    echo -e "Done!\n"
}

generate_phase_2 () {
    local outdir="$1" circuit="$2" pathToCircuitDir="$3"
    echo "$outdir";
    mkdir -p "$outdir";

    echo "Setting up Phase 2 ceremony for $circuit"
    echo "Outputting circuit_final.zkey and verifier.sol to $outdir"

    npx snarkjs groth16 setup "$pathToCircuitDir/$circuit.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_0000.zkey"
    echo "test" | npx snarkjs zkey contribute "$outdir/circuit_0000.zkey" "$outdir/circuit_0001.zkey" --name"1st Contributor name" -v
    npx snarkjs zkey verify "$pathToCircuitDir/$circuit.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_0001.zkey"
    npx snarkjs zkey beacon "$outdir/circuit_0001.zkey" "$outdir/circuit_final.zkey" 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
    npx snarkjs zkey verify "$pathToCircuitDir/$circuit.r1cs" powersOfTau28_hez_final_22.ptau "$outdir/circuit_final.zkey"
    npx snarkjs zkey export verificationkey "$outdir/circuit_final.zkey" "$outdir/verification_key.json"  

    npx snarkjs zkey export solidityverifier "$outdir/circuit_final.zkey" $outdir/verifier.sol
    echo "Done!\n"
}

move_verifiers_and_metadata () {
    local indir="$1" depth="$2" maxEdges="$3"
    # cp "$indir/circuit_final.zkey" "protocol-solidity-fixtures/fixtures/$anchorType/$depth/circuit_final.zkey"

    mkdir -p "contracts/verifiers/depth$depth"
    # mkdir -p contracts/verifiers/depth20
    cp "$indir/verifier.sol" contracts/verifiers/depth$depth/Verifier"$depth"\_"$maxEdges".sol
    # sed -i 's/pragma solidity ^0.8.0;'/'pragma solidity ^0.8.0;'/ contracts/verifiers/$anchorType/"Verifier$size\_$nIns.sol"
    # sed -i "s/contract Verifier {"/"contract Verifier$size\_$nIns {"/ contracts/verifiers/$anchorType/"Verifier$size\_$nIns.sol"
}


compile "$outdir" semaphore_20_2 2
compile "$outdir" semaphore_20_7 7

generate_phase_2 ./artifacts/circuits/semaphore_20_2 semaphore_20_2 ./artifacts/circuits/2
generate_phase_2 ./artifacts/circuits/semaphore_20_7 semaphore_20_7 ./artifacts/circuits/7

move_verifiers_and_metadata ./artifacts/circuits/semaphore_20_2 20 2
move_verifiers_and_metadata ./artifacts/circuits/semaphore_20_7 20 7
