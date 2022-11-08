# check if circom is installed
if ! command -v circom &> /dev/null
then
    echo "circom not found. please install"
    exit
fi

artifacts_dir='snark-artifacts'

# cleanup
mkdir -p $artifacts_dir

# TODO: Add artifacts
circom packages/circuits/semaphore.circom --r1cs --wasm -o $artifacts_dir

if [ ! -f $artifacts_dir/dev_final.ptau ]
then
    node node_modules/snarkjs/cli.js powersoftau new bn128 14 $artifacts_dir/dev.ptau -v
    node node_modules/snarkjs/cli.js powersoftau prepare phase2 $artifacts_dir/dev.ptau $artifacts_dir/dev_final.ptau -v
else
    echo "skip powers of tau"
fi

node node_modules/snarkjs/cli.js groth16 setup $artifacts_dir/semaphore.r1cs $artifacts_dir/dev_final.ptau $artifacts_dir/semaphore.zkey
node node_modules/snarkjs/cli.js zkey export verificationkey $artifacts_dir/semaphore.zkey $artifacts_dir/semaphore.json

mv $artifacts_dir/semaphore_js/semaphore.wasm $artifacts_dir/semaphore.wasm