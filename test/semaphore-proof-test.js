const { expect } = require("chai");
const {ethers } = require('hardhat');
const { poseidon_gencontract: poseidonGenContract } = require("circomlibjs");
const { Semaphore, generateMerkleProof, genExternalNullifier, genSignalHash } = require("@libsem/protocols");
const { ZkIdentity } = require("@libsem/identity");
const path = require("path");
const { genNullifierHash } = require("./helpers");

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
      await semaphore.insertIdentity(tmpCommitment);
    }
})

describe("Semaphore contract", () => {
    it("Should generate full semaphore proof", async () => {
      const identity = new ZkIdentity();
      const identityCommitment = identity.genIdentityCommitment();

      await semaphore.insertIdentity(identityCommitment);

      const signal = "0x111";
      const nullifierHash = genNullifierHash(defaultExternalNullifier, identity.getNullifier(), 20)

      const commitments = Object.assign([], identityCommitments)
      commitments.push(identityCommitment)

      const merkleProof = generateMerkleProof(20, ZERO_VALUE, 5, commitments, identityCommitment)
      const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, defaultExternalNullifier, signal)

      const wasmFilePath = path.join("./zkeyFiles", "semaphore.wasm")
      const finalZkeyPath = path.join("./zkeyFiles", "semaphore_final.zkey")

      const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
      const solidityProof = Semaphore.packToSolidityProof(fullProof);

      const packedProof = await semaphore.packProof(
        solidityProof.a,
        solidityProof.b,
        solidityProof.c,
      );

      const preBroadcastCheck = await semaphore.preBroadcastCheck(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
        packedProof,
        merkleProof.root,
        nullifierHash,
        genSignalHash(signal),
        defaultExternalNullifier
      )

      expect(preBroadcastCheck).to.be.true;

      let res = await semaphore.broadcastSignal(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
        packedProof,
        merkleProof.root,
        nullifierHash,
        defaultExternalNullifier
      )

      expect(res).to.not.equal(null);

    })
})
