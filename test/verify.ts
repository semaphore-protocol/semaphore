const snarkjs = require("snarkjs");
import * as fs from 'fs';
import * as path from 'path';
import { ZkIdentity, Identity } from '@libsem/identity';
import { Semaphore, MerkleProof, IProof, generateMerkleProof, genExternalNullifier, genSignalHash } from '@libsem/protocols';
import * as ethers from 'ethers';

const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]));

async function run() {
    const identityCommitments: Array<bigint> = [];
    const leafIndex = 3;

    for (let i=0; i<leafIndex;i++) {
      const tmpIdentity = ZkIdentity.genIdentity();
      const tmpCommitment: bigint = ZkIdentity.genIdentityCommitment(tmpIdentity);
      identityCommitments.push(tmpCommitment);
    }

    const identity: Identity = ZkIdentity.genIdentity();
    const externalNullifier: string = genExternalNullifier("voting_1");
    const signal = '0x111';
    const identityCommitment: bigint = ZkIdentity.genIdentityCommitment(identity);
    const nullifierHash: bigint = Semaphore.genNullifierHash(externalNullifier, identity.identityNullifier, 20);

    const commitments: Array<bigint> = Object.assign([], identityCommitments);
    commitments.push(identityCommitment);

    const merkleProof: MerkleProof = generateMerkleProof(20, BigInt(0), 5, commitments, identityCommitment);
    const witness: IProof = Semaphore.genWitness(identity, merkleProof, externalNullifier, signal);

    const publicSignals: Array<bigint | string> = [merkleProof.root, nullifierHash, genSignalHash(signal), externalNullifier];

    const vkeyPath: string = path.join('./zkeyFiles', 'verification_key.json');
    const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));

    const wasmFilePath: string = path.join('./zkeyFiles', 'semaphore.wasm');
    const finalZkeyPath: string = path.join('./zkeyFiles', 'semaphore_final.zkey');

    const fullProof: IProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath);
    const res: boolean = await Semaphore.verifyProof(vKey, { proof: fullProof.proof, publicSignals });

    if(res) {
        console.log('VERIFICATION OK');
    } else {
        console.log('VERIFICATION FAILED');
    }
}

run().then(() => {
    process.exit(0);
});