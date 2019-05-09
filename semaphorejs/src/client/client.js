const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {unstringifyBigInts, stringifyBigInts} = require('snarkjs/src/stringifybigint.js');


const chai = require('chai');
const assert = chai.assert;

const snarkjs = require('snarkjs');
const circomlib = require('circomlib');

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimc7 = circomlib.mimc7;

const groth = snarkjs.groth;

const fetch = require("node-fetch");

const Web3 = require('web3');

const winston = require('winston');

const SemaphoreABI = require('../../build/contracts/Semaphore.json');

const SemaphoreModules = require('./semaphore.js');
const SemaphoreClient = SemaphoreModules.client;
const generate_identity = SemaphoreModules.generate_identity;

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

process.on('unhandledRejection', function(err, promise) {
    logger.error(err.message);
    process.exit(1);
});

process.on('uncaughtException', function(err) {
    logger.error(err.message);
    process.exit(1);
});


const stored_identity_path = process.env.IDENTITY_PATH || 'semaphore_identity.json';

switch(process.argv[2]) {
case 'generate_identity':
const generated_identity = generate_identity(logger);
fs.writeFileSync(stored_identity_path, JSON.stringify(generated_identity));
break;

case 'signal':
if (process.argv.length < 4) {
    throw new Error('cannot send an empty signal');
}


let loaded_identity;
if (fs.existsSync(stored_identity_path)) {
    loaded_identity = JSON.parse(fs.readFileSync(stored_identity_path));
} else {
    throw new Error(`cannot find stored identity in ${stored_identity_path}`);
}


const cir_def = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
const proving_key = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/proving_key.json')).toString());
const transaction_confirmation_blocks = parseInt(process.env.TRANSACTION_CONFIRMATION_BLOCKS) || 24;

const semaphore = new SemaphoreClient(
    process.env.NODE_URL,
    loaded_identity,
    SemaphoreABI,
    cir_def,
    proving_key,
    process.env.EXTERNAL_NULLIFIER,
    process.env.IDENTITY_INDEX,
    process.env.SEMAPHORE_SERVER_URL,
    process.env.CONTRACT_ADDRESS,
    process.env.FROM_PRIVATE_KEY,
    process.env.FROM_ADDRESS,
    parseInt(process.env.CHAIN_ID),
    transaction_confirmation_blocks,
    logger,
);
semaphore.broadcast_signal(process.argv[3]);
break;
}
