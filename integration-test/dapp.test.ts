const { ethers } = require("hardhat");
import * as fs from 'fs';
import * as path from 'path';
import { ZkIdentity, Identity  } from "@libsem/identity";
import { Semaphore, MerkleProof, IProof, genExternalNullifier, genSignalHash, generateMerkleProof  } from "@libsem/protocols";

let deployedSemaphore;
let provider;
let SemaphoreContract;
let defaultExternalNullifier: string;
let wallet;
const identityCommitments: Array<bigint> = [];
const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]))

beforeAll(async () => {
    const [signer1] = await ethers.getSigners();
    const signerAddress = await signer1.getAddress();
    deployedSemaphore = JSON.parse(fs.readFileSync('./deployments/localhost/Semaphore.json', { encoding: 'utf-8' }));
    provider = ethers.providers.getDefaultProvider('http://localhost:8545');
    wallet = new ethers.Wallet(signerAddress, provider);
    SemaphoreContract = new ethers.Contract(deployedSemaphore.address, deployedSemaphore.abi, wallet);
    defaultExternalNullifier = genExternalNullifier("voting_1");
    const semaphoreOwner = await SemaphoreContract.owner();
    console.log('Semaphore owner: ', semaphoreOwner);
    console.log('Signer', signer1.address);
    const isOwner = await SemaphoreContract.isOwner();
    console.log('Is owner', isOwner);
})

test('Semaphore proof', async () => {
    const identity: ZkIdentity = new ZkIdentity();
    const identityCommitment: bigint = identity.genIdentityCommitment();

    const signal = "0x111";
    const nullifierHash = Semaphore.genNullifierHash(defaultExternalNullifier, identity.getNullifier(), 20)

    const commitments = Object.assign([], identityCommitments)
    commitments.push(identityCommitment)

    const merkleProof: MerkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
    const witness: any = Semaphore.genWitness(identity.getIdentity(), merkleProof, defaultExternalNullifier, signal)

    const wasmFilePath: string = path.join("./zkeyFiles", "semaphore.wasm")
    const finalZkeyPath: string = path.join("./zkeyFiles", "semaphore_final.zkey")

    // const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
    // const solidityProof = Semaphore.packToSolidityProof(fullProof);

    // const packedProof = await SemaphoreContract.packProof(
    //     solidityProof.a, 
    //     solidityProof.b, 
    //     solidityProof.c,
    // );

    // console.log(fullProof);

    // const preBroadcastCheck = await SemaphoreContract.preBroadcastCheck(
    //     ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
    //     packedProof,
    //     merkleProof.root,
    //     nullifierHash,
    //     genSignalHash(signal),
    //     defaultExternalNullifier
    // )

    // console.log('Prebroadcast check:', preBroadcastCheck);
    // await tx.wait();
    // let res = null;
    // res = await SemaphoreContract.broadcastSignal(
    //   ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
    //   packedProof,
    //   merkleProof.root,
    //   nullifierHash,
    //   defaultExternalNullifier
    // )

    // console.log(res);

});