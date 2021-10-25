import { ethers } from "ethers";
import { ZkIdentity } from "@libsem/identity";
import { Semaphore, generateMerkleProof, genExternalNullifier, FullProof, MerkleProof } from "@libsem/protocols";
import * as path from "path";
import * as fs from "fs";

const SemaphoreInfo = JSON.parse(fs.readFileSync("./deployments/localhost/Semaphore.json", { encoding: "utf-8"}));
const pk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const defaultExternalNullifier = genExternalNullifier('test-voting');
const identityCommitments: Array<bigint> = [];
const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]))
const wasmFilePath = path.join("./zkeyFiles", "semaphore.wasm")
const finalZkeyPath = path.join("./zkeyFiles", "semaphore_final.zkey")
let SemaphoreContract;

beforeAll(async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = new ethers.Wallet(pk, provider);

    SemaphoreContract = new ethers.Contract(SemaphoreInfo.address, SemaphoreInfo.abi, provider);
    SemaphoreContract = SemaphoreContract.connect(signer);
})

test('Should create semaphore full proof', async () => {
    const identity = new ZkIdentity();
    const identityCommitment = identity.genIdentityCommitment();

    const semaphoreRootBefore = await SemaphoreContract.root();

    let tx = await SemaphoreContract.insertIdentity(identityCommitment);
    await tx.wait();

    const signal = "0x111";
    const nullifierHash = Semaphore.genNullifierHash(defaultExternalNullifier, identity.getNullifier(), 20);

    const commitments = Object.assign([], identityCommitments);
    commitments.push(identityCommitment);

    const merkleProof: MerkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
    const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, defaultExternalNullifier, signal)

    const fullProof: FullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
    const solidityProof = Semaphore.packToSolidityProof(fullProof);

    const packedProof = await SemaphoreContract.packProof(
      solidityProof.a, 
      solidityProof.b, 
      solidityProof.c,
    );

    let res = null;
    res = await SemaphoreContract.broadcastSignal(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
      packedProof,
      merkleProof.root,
      nullifierHash,
      defaultExternalNullifier
    )
}, 60000)
