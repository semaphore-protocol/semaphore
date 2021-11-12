import {expect} from "chai";
import {ethers} from "ethers";
import {ZkIdentity} from "@libsem/identity";
import {FullProof, generateMerkleProof, genExternalNullifier, MerkleProof, Semaphore} from "@libsem/protocols";
import {genNullifierHash} from "../test/helpers";
import * as path from "path";
import * as fs from "fs";

const SemaphoreInfo = JSON.parse(fs.readFileSync("./deployments/localhost/Semaphore.json", {encoding: "utf-8"}));
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

    if (!!ethers["provider"] && !!ethers["getSigners"]) {
        const defaultSigner = await ethers["getSigners"]()[0];
        await defaultSigner.sendTransaction({to: signer.address, value: BigInt(1e18)});
    }

    SemaphoreContract = new ethers.Contract(SemaphoreInfo.address, SemaphoreInfo.abi, provider);
    SemaphoreContract = SemaphoreContract.connect(signer);
})

test('Should create semaphore full proof', async () => {
    const identity = new ZkIdentity();
    const identityCommitment = identity.genIdentityCommitment();

    let tx = await SemaphoreContract.insertIdentity(identityCommitment);
    await tx.wait();

    const signal = "0x111";
    const nullifierHash = genNullifierHash(defaultExternalNullifier, identity.getNullifier());

    identityCommitments.push(identityCommitment);

    const merkleProof: MerkleProof = generateMerkleProof(20, ZERO_VALUE, 5, identityCommitments, identityCommitment)
    const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, defaultExternalNullifier, signal)

    const fullProof: FullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
    const solidityProof = Semaphore.packToSolidityProof(fullProof);

    const packedProof = await SemaphoreContract.packProof(
        solidityProof.a,
        solidityProof.b,
        solidityProof.c,
    );

    let res = await SemaphoreContract.broadcastSignal(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
        packedProof,
        merkleProof.root,
        nullifierHash,
        defaultExternalNullifier
    );
    expect(res).to.not.equal(null);
    return Promise.resolve();

}, 60000);
