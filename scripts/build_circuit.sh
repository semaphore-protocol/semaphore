#!/bin/bash

outdir=artifacts/circuits

mkdir -p $outdir;
# pathToCircuitDir=artifacts/circuits
# pathToCircuitDir=./build/circuit_artifacts/artifacts

compile () {
    local outdir="$1" circuit="$2" depth="$3" length="$4"
    # mkdir -p "build/$outdir"
    mkdir -p "$outdir/$depth/$length"
    echo "Compiling circuit: circuits/$circuit.circom"
    ~/.cargo/bin/circom --r1cs --wasm --sym \
        -o "./$outdir/$depth/$length/" \
        "circuits/$circuit.circom"
    echo -e "Done!\n"
}

generate_phase_2 () {
    local circuit_dir="$1" circuit_name="$2"
    echo "$circuit_dir";
    mkdir -p "$circuit_dir";

    echo "Setting up Phase 2 ceremony for $circuit_name"
    echo "Outputting circuit_final.zkey and verifier.sol to $circuit_dir"

    npx snarkjs groth16 setup "$circuit_dir/$circuit_name.r1cs" powersOfTau28_hez_final_22.ptau "$circuit_dir/circuit_0000.zkey"
    echo "test" | npx snarkjs zkey contribute "$circuit_dir/circuit_0000.zkey" "$circuit_dir/circuit_0001.zkey" --name"1st Contributor name" -v
    npx snarkjs zkey verify "$circuit_dir/$circuit_name.r1cs" powersOfTau28_hez_final_22.ptau "$circuit_dir/circuit_0001.zkey"
    npx snarkjs zkey beacon "$circuit_dir/circuit_0001.zkey" "$circuit_dir/circuit_final.zkey" 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
    npx snarkjs zkey verify "$circuit_dir/$circuit_name.r1cs" powersOfTau28_hez_final_22.ptau "$circuit_dir/circuit_final.zkey"
    npx snarkjs zkey export verificationkey "$circuit_dir/circuit_final.zkey" "$circuit_dir/verification_key.json"  

    npx snarkjs zkey export solidityverifier "$circuit_dir/circuit_final.zkey" $circuit_dir/verifier.sol
    echo "Done!\n"
}

move_verifiers_and_metadata () {
    local indir="$1" depth="$2" length="$3" fixturesDir="fixtures"
    # cp "$indir/circuit_final.zkey" "protocol-solidity-fixtures/fixtures/$anchorType/$depth/circuit_final.zkey"

    mkdir -p "$fixturesDir"/"$depth"/"$length"
    # mkdir -p contracts/verifiers/depth20
    cp "$indir/verifier.sol" contracts/verifiers/Verifier"$depth"\_"$length".sol
    cp "$indir/circuit_final.zkey" "$fixturesDir"/"$depth"/"$length"/circuit_final.zkey
    cp "$indir/verification_key.json" "$fixturesDir"/"$depth"/"$length"/verification_key.json
    cp "$indir"/semaphore_"$depth"_"$length".r1cs "$fixturesDir"/"$depth"/"$length"/semaphore_"$depth"_"$length".r1cs
    cp "$indir"/semaphore_"$depth"_"$length".sym "$fixturesDir"/"$depth"/"$length"/semaphore_"$depth"_"$length".sym
    cp "$indir"/semaphore_"$depth"_"$length"_js/semaphore_"$depth"_"$length".wasm "$fixturesDir"/"$depth"/"$length"/semaphore_"$depth"_"$length".wasm
    cp "$indir"/semaphore_"$depth"_"$length"_js/witness_calculator.js "$fixturesDir"/"$depth"/"$length"/witness_calculator.js
    sed -i 's/pragma solidity ^0.6.11/pragma solidity ^0.8.4/' contracts/verifiers/Verifier"$depth"\_"$length".sol
    sed -i "s/contract Verifier {/contract Verifier$depth\_$length {/" contracts/verifiers/Verifier"$depth"_"$length".sol
}

# compile $outdir $circuit_name $depth $length
compile "$outdir" semaphore_20_2 20 2
compile "$outdir" semaphore_20_7 20 7
compile "$outdir" semaphore_19_2 19 2
compile "$outdir" semaphore_19_7 19 7
#
generate_phase_2 ./artifacts/circuits/20/2 semaphore_20_2
generate_phase_2 ./artifacts/circuits/20/7 semaphore_20_7
generate_phase_2 ./artifacts/circuits/19/2 semaphore_19_2
generate_phase_2 ./artifacts/circuits/19/7 semaphore_19_7

move_verifiers_and_metadata ./artifacts/circuits/20/2 20 2
move_verifiers_and_metadata ./artifacts/circuits/20/7 20 7
move_verifiers_and_metadata ./artifacts/circuits/19/2 19 2
move_verifiers_and_metadata ./artifacts/circuits/19/7 19 7
