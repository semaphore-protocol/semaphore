cd "$(dirname "$0")"

mkdir -p ../build
mkdir -p ../zkeyFiles
mkdir -p ../contracts

cd ../build

if [ -f ./powersOfTau28_hez_final_14.ptau ]; then
    echo "powersOfTau28_hez_final_14.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_14.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
fi

circom ../circuits/semaphore.circom --r1cs --wasm --sym
snarkjs r1cs export json semaphore.r1cs semaphore.r1cs.json

snarkjs groth16 setup semaphore.r1cs powersOfTau28_hez_final_14.ptau semaphore_0000.zkey

snarkjs zkey contribute semaphore_0000.zkey semaphore_0001.zkey --name="Frist contribution" -v -e="Random entropy"
snarkjs zkey contribute semaphore_0001.zkey semaphore_0002.zkey --name="Second contribution" -v -e="Another random entropy"
snarkjs zkey beacon semaphore_0002.zkey semaphore_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

snarkjs zkey export verificationkey semaphore_final.zkey verification_key.json
snarkjs zkey export solidityverifier semaphore_final.zkey verifier.sol

cp verifier.sol ../contracts/Verifier.sol
cp verification_key.json ../zkeyFiles/verification_key.json
cp semaphore_js/semaphore.wasm ../zkeyFiles/semaphore.wasm
cp semaphore_final.zkey ../zkeyFiles/semaphore_final.zkey