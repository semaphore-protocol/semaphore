# check if circom is installed
if ! command -v circom &> /dev/null
then
    echo "circom not found. please install"
    exit
fi

build_circuits=( "semaphore" )
artifacts_dir="snark-artifacts"

# cleanup
mkdir -p $artifacts_dir

if [ ! -f $artifacts_dir/dev_final.ptau ]
then
    node node_modules/snarkjs/cli.js powersoftau new bn128 14 $artifacts_dir/dev.ptau -v
    node node_modules/snarkjs/cli.js powersoftau prepare phase2 $artifacts_dir/dev.ptau $artifacts_dir/dev_final.ptau -v
else
    echo "skip powers of tau"
fi

for circuit in "${build_circuits[@]}"
do
    circom packages/circuits/$circuit.circom --r1cs --wasm -o $artifacts_dir
    node node_modules/snarkjs/cli.js groth16 setup $artifacts_dir/$circuit.r1cs $artifacts_dir/dev_final.ptau $artifacts_dir/$circuit.zkey
    node node_modules/snarkjs/cli.js zkey export verificationkey $artifacts_dir/$circuit.zkey $artifacts_dir/$circuit.json
    mv $artifacts_dir/${circuit}_js/$circuit.wasm $artifacts_dir/$circuit.wasm
done

