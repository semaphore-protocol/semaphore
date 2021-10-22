const { expect, before } = require("chai");
const {ethers } = require('hardhat');
const { poseidon_gencontract: poseidonGenContract } = require("circomlibjs");
const { Semaphore, generateMerkleProof, genExternalNullifier, genSignalHash } = require("@libsem/protocols");
const { ZkIdentity } = require("@libsem/identity");

const deployPoseidonTx = (x) => {
    return ethers.getContractFactory(
        poseidonGenContract.generateABI(x),
        poseidonGenContract.createCode(x)
    )
}
let semaphore;
let defaultExternalNullifier;
const identityCommitments = [];
const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]))


before("*", async () => {
    defaultExternalNullifier = genExternalNullifier("voting_1");
    newExternalNullifier = genExternalNullifier('voting-2');

    const PoseidonT3 = await deployPoseidonTx(2);
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.deployed();

    const PoseidonT6 = await deployPoseidonTx(5);
    const poseidonT6 = await PoseidonT6.deploy();
    await poseidonT6.deployed();

    const Semaphore = await ethers.getContractFactory("Semaphore", {
        libraries: {
            PoseidonT3: poseidonT3.address,
            PoseidonT6: poseidonT6.address,
        }
    });
    semaphore = await Semaphore.deploy(20, defaultExternalNullifier);
    await semaphore.deployed();

    const leafIndex = 3

    for (let i = 0; i < leafIndex; i++) {
      const tmpIdentity = new ZkIdentity();
      const tmpCommitment = tmpIdentity.genIdentityCommitment();
      identityCommitments.push(tmpCommitment)
    }
})

describe("Semaphore contract", () => {
    it("Should generate full semaphore proof", async () => {
      const identity = new ZkIdentity();
      const identityCommitment = identity.genIdentityCommitment();

      await semaphore.insertIdentity(identityCommitment);

      const signal = "0x111";
      const nullifierHash = Semaphore.genNullifierHash(externalNullifier, identity.getNullifier(), 20)

      const commitments = Object.assign([], identityCommitments)
      commitments.push(identityCommitment)

      const merkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
      const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, externalNullifier, signal)

      const publicSignals = [
        merkleProof.root,
        nullifierHash,
        genSignalHash(signal),
        externalNullifier
      ]

      const vkeyPath = path.join("./zkeyFiles", "semaphore", "verification_key.json")
      const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))

      const wasmFilePath = path.join("./zkeyFiles", "semaphore", "semaphore.wasm")
      const finalZkeyPath = path.join("./zkeyFiles", "semaphore", "semaphore_final.zkey")

      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const res = await Semaphore.verifyProof(vKey, { proof: fullProof.proof, publicSignals })
    })
})