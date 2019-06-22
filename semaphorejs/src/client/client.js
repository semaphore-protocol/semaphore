#!/usr/bin/env node

/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

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

const groth = snarkjs.groth;

const fetch = require("node-fetch");

const Web3 = require('web3');

const winston = require('winston');

const BASE_DIR = process.env.BASE_DIR || process.cwd();

const SemaphoreABI = require(BASE_DIR + '/build/contracts/Semaphore.json');

const SemaphoreModules = require('./semaphore.js');
const SemaphoreClient = SemaphoreModules.client;
const generate_identity = SemaphoreModules.generate_identity;

if (process.env.CONFIG_ENV) {
  client_config = process.env;
} else {
  client_config = require(process.env.CONFIG_PATH || BASE_DIR + '/client-config.json');
}

const logger = winston.createLogger({
    level: client_config.LOG_LEVEL,
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
    logger.error(err.stack);
    process.exit(1);
});

process.on('uncaughtException', function(err) {
    logger.error(err.stack);
    process.exit(1);
});


const stored_identity_path = client_config.IDENTITY_PATH || 'semaphore_identity.json';

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


const cir_def = JSON.parse(fs.readFileSync(BASE_DIR + '/build/circuit.json', 'utf8'));
const proving_key = fs.readFileSync(BASE_DIR + '/build/proving_key.bin');
const verification_key = JSON.parse(fs.readFileSync(BASE_DIR + '/build/verification_key.json', 'utf8'));
const transaction_confirmation_blocks = parseInt(client_config.TRANSACTION_CONFIRMATION_BLOCKS) || 24;

const semaphore = new SemaphoreClient(
    client_config.NODE_URL,
    loaded_identity,
    SemaphoreABI,
    cir_def,
    proving_key,
    verification_key,
    client_config.EXTERNAL_NULLIFIER,
    null,
    client_config.SEMAPHORE_SERVER_URL,
    client_config.CONTRACT_ADDRESS,
    client_config.FROM_PRIVATE_KEY,
    client_config.FROM_ADDRESS,
    parseInt(client_config.CHAIN_ID),
    transaction_confirmation_blocks,
    true,
    client_config.BROADCASTER_ADDRESS,
    logger,
);
semaphore.broadcast_signal(process.argv[3])
.then(() => {
  logger.info('Done sending.');
  process.exit(0);
})
.catch((err) => {
  logger.error(`Error sending: ${err.stack}`);
  process.exit(1);
});
break;
}
