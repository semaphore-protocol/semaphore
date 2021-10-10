const poseidonGenContract = require('circomlib/src/poseidon_gencontract.js');
const path = require('path');
const fs = require('fs');
const Web3 = require('web3');

const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]));
const SNARK_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

const { FastSemaphore } = require('libsemaphore');
const { expect } = require('chai');

describe("Semaphore", function () {
    it("Should broadcast signal", async function () {
      const PoseidonT3 = await ethers.getContractFactory(
          poseidonGenContract.generateABI(2),
          poseidonGenContract.createCode(2)
      )
      const poseidonT3 = await PoseidonT3.deploy();
      await poseidonT3.deployed();
  
  
      const PoseidonT6 = await ethers.getContractFactory(
          poseidonGenContract.generateABI(5),
          poseidonGenContract.createCode(5)
      );
      const poseidonT6 = await PoseidonT6.deploy();
      await poseidonT6.deployed();
  
      const Hasher = await ethers.getContractFactory("Hasher", {
          libraries: {
              PoseidonT3: poseidonT3.address,
              PoseidonT6: poseidonT6.address,
          },
        });
      const hasher = await Hasher.deploy();
      await hasher.deployed();

      const externalNullifier = FastSemaphore.genExternalNullifier("voting-1");

      const Semaphore = await ethers.getContractFactory("Semaphore", {
          libraries: {
              PoseidonT3: poseidonT3.address,
              PoseidonT6: poseidonT6.address,
          }
      });
      const semaphore = await Semaphore.deploy(20, externalNullifier);
      await semaphore.deployed();

      FastSemaphore.setHasher('poseidon');
      const leafIndex = 4;

      const idCommitments = [];

      for (let i=0; i<leafIndex;i++) {
        const tmpIdentity = FastSemaphore.genIdentity();
        const tmpCommitment = FastSemaphore.genIdentityCommitment(tmpIdentity);
        idCommitments.push(tmpCommitment);
      }

      const promises = idCommitments.map(async (id) => {
        const index = await semaphore.insertIdentity(id);
        return index;
      });

      await Promise.all(promises);


      const identity = FastSemaphore.genIdentity();
      let signal = 'yes';
      signal = Web3.utils.utf8ToHex(signal);
      const signalHash = FastSemaphore.genSignalHash(signal);
      const nullifiersHash = FastSemaphore.genNullifierHash(externalNullifier, identity.identityNullifier, 20);
      const identityCommitment = FastSemaphore.genIdentityCommitment(identity);

      await semaphore.insertIdentity(identityCommitment);

      const wasmFilePath =  path.join('./zkeyFiles', 'semaphore.wasm');
      const finalZkeyPath = path.join('./zkeyFiles', 'semaphore_final.zkey');

      idCommitments.push(identityCommitment);

      const witnessData = await FastSemaphore.genProofFromIdentityCommitments(
        identity, externalNullifier, signal, wasmFilePath, finalZkeyPath, 
        idCommitments, 20, ZERO_VALUE, 5
      );
  

      const { fullProof, root } = witnessData;
      const solidityProof = FastSemaphore.packToSolidityProof(fullProof);


      const packedProof = await semaphore.packProof(
        solidityProof.a, 
        solidityProof.b, 
        solidityProof.c,
      );

      const preBroadcastCheck = await semaphore.preBroadcastCheck(
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
          packedProof,
          root,
          nullifiersHash,
          signalHash,
          externalNullifier
      )

      expect(preBroadcastCheck).to.be.true;

      const res = await semaphore.broadcastSignal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
            packedProof,
            root,
            nullifiersHash,
            externalNullifier
      )

      expect(res.hash).to.be.an('string');

    // const verificationRes = await semaphore.verifyProof(
    //   solidityProof.a,
    //   solidityProof.b,
    //   solidityProof.c,
    //   solidityProof.inputs
    // );
  
    });
  });