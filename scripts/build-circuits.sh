cd "$(dirname "$0")"
mkdir -p ../build
cd ../build

cd "$(dirname "$0")"
mkdir -p ../zkeyFiles

npx circom ../circuits/semaphore.circom --r1cs --wasm --sym

if [ -f ./powersOfTau28_hez_final_16.ptau ]; then
    echo "powersOfTau28_hez_final_16.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_16.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau
fi

npx snarkjs zkey new semaphore.r1cs powersOfTau28_hez_final_16.ptau semaphore_0000.zkey

npx snarkjs zkey contribute semaphore_0000.zkey semaphore_final.zkey

npx snarkjs zkey export verificationkey semaphore_final.zkey verification_key.json

npx snarkjs zkey export solidityverifier semaphore_final.zkey verifier.sol

mv verifier.sol ../contracts/Verifier.sol

cp verification_key.json ../zkeyFiles/verification_key.json
cp semaphore.wasm ../zkeyFiles/semaphore.wasm
cp semaphore_final.zkey ../zkeyFiles/semaphore_final.zkey
