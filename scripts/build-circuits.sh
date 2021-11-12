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

if [ -z "${CIRCOM_DOCKER}" ]; then
  circom ../circuits/semaphore.circom --r1cs --wasm --sym || exit 1
else
  ../scripts/circom-docker.sh ./circuits/semaphore.circom --r1cs --wasm --sym -o ./build || exit 1
fi

snarkjs r1cs export json semaphore.r1cs semaphore.r1cs.json

snarkjs groth16 setup semaphore.r1cs powersOfTau28_hez_final_14.ptau semaphore_0000.zkey

random() {
  node -e "console.log(crypto.randomBytes(32).toString('hex'))"
}

if [ -z "${SNARK_CONTRIB_RANDOM_ONE}" ]; then
  SNARK_CONTRIB_RANDOM_ONE=$(random)
fi
snarkjs zkey contribute semaphore_0000.zkey semaphore_0001.zkey --name="Frist contribution" -v -e="${SNARK_CONTRIB_RANDOM_ONE}"

if [ -z "${SNARK_CONTRIB_RANDOM_TWO}" ]; then
  SNARK_CONTRIB_RANDOM_TWO=$(random)
fi
snarkjs zkey contribute semaphore_0001.zkey semaphore_0002.zkey --name="Second contribution" -v -e="${SNARK_CONTRIB_RANDOM_TWO}"

if [ -z "${SNARK_CONTRIB_BEACON}" ]; then
  SNARK_CONTRIB_BEACON=$(random)
fi
snarkjs zkey beacon semaphore_0002.zkey semaphore_final.zkey "${SNARK_CONTRIB_BEACON}" 10 --name="Final Beacon phase2"

snarkjs zkey export verificationkey semaphore_final.zkey verification_key.json
snarkjs zkey export solidityverifier semaphore_final.zkey verifier.sol

cp verifier.sol ../contracts/Verifier.sol
cp verification_key.json ../zkeyFiles/verification_key.json
cp semaphore_js/semaphore.wasm ../zkeyFiles/semaphore.wasm
cp semaphore_final.zkey ../zkeyFiles/semaphore_final.zkey
