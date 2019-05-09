const crypto = require('crypto');
const {unstringifyBigInts, stringifyBigInts} = require('snarkjs/src/stringifybigint.js');

const chai = require('chai');
const assert = chai.assert;

const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;

const eddsa = require('circomlib/src/eddsa');
const mimc7 = require('circomlib/src/mimc7');

const groth = snarkjs.groth;

const fetch = require('node-fetch');

const SemaphoreModules = require('./semaphore.js');
const SemaphoreClient = SemaphoreModules.client;
const generate_identity = SemaphoreModules.generate_identity;

const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg) => console.log(`ERRROR: ${msg}`),
  debug: (msg) => console.log(`DEBUG: ${msg}`),
  verbose: (msg) => {},
};

  const loaded_identity = {
    "private_key": "991d5bfeb44c137bb84055981bbd0b1b36076183ac048918496dfdef54ea054c",
    "identity_nullifier":"0x0fd6fb484890f9c31f3dac0a1046db476b275e2dd44dd19351f06e43cb4a71",
    "identity_r":"0x8b235145c1605b0473d2d215a62a9f60b6e37b901e6a00d9be88cde0b3b128",
    "identity_commitment":"17125566502705933915404206431340929706290352994945609284190202229100755467605"
  };


const SemaphoreABI = require('../../build/contracts/Semaphore.json');

(async () => {
  const cir_def = await (await fetch('circuit.json')).json();
  const proving_key = await (await fetch('proving_key.json')).json();

  const semaphore = new SemaphoreClient(
    'http://localhost:7545',
    loaded_identity,
    SemaphoreABI,
    cir_def,
    proving_key,
    '12312',
    null,
    'http://localhost:3000',
    '0x11E3721477C144a6285fA259f0e379188C0a3A50',
    '0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21',
    '0x1929c15f4e818abf2549510622a50c440c474223',
    5777,
    1,
    logger,
  );
  window.semaphore = semaphore;
  window.generate_identity = generate_identity;
  window.logger = logger;
})();
