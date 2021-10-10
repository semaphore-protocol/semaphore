const snarkjs = require("snarkjs");
import * as fs from 'fs';
import { FastSemaphore, Identity, IWitnessData } from 'libsemaphore';
import * as ethers from 'ethers';

const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]));

async function run() {
    FastSemaphore.setHasher('poseidon');
    const n_levels = 20;
    const externalNullifier = FastSemaphore.genExternalNullifier('fast-sempahore-demo');
    const signalHash = FastSemaphore.genSignalHash('hello fast semaphore');
    const identity: Identity = FastSemaphore.genIdentity();
    const idCom = FastSemaphore.genIdentityCommitment(identity);

    
    const tree = FastSemaphore.createTree(20, ZERO_VALUE, 5);
    tree.insert(idCom);
    const merkleeProof = tree.genMerklePath(0);
    // console.log(tree.zeros.length)

    const nullifierHash = FastSemaphore.genNullifierHash(externalNullifier, identity.identityNullifier, n_levels);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
        signal_hash: signalHash,
        external_nullifier: externalNullifier,
        identity_path_index: merkleeProof.indices,
        path_elements: merkleeProof.pathElements,
        identity_nullifier: identity.identityNullifier,
        identity_trapdoor: identity.identityTrapdoor
    }
    , "./zkeyFiles/semaphore.wasm", "./zkeyFiles/semaphore_final.zkey");

    const pubSignals = [tree.root, nullifierHash, signalHash, externalNullifier];

    const vKey = JSON.parse(fs.readFileSync("./zkeyFiles/verification_key.json", 'utf-8'));
    const res = await snarkjs.groth16.verify(vKey, pubSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

run().then(() => {
    process.exit(0);
});