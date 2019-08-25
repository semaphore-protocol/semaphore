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
const path = require('path');
const {unstringifyBigInts, stringifyBigInts} = require('websnark/tools/stringifybigint.js');

const chai = require('chai');
const assert = chai.assert;

const snarkjs = require('snarkjs');
const circomlib = require('circomlib');

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimcsponge = circomlib.mimcsponge;

const proof_util = require('../util');

const fetch = require('node-fetch');

const Web3 = require('web3');

const ethers = require('ethers');

let logger;

/* uint8array to hex */

function hex(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function pedersenHash(ints) {
  const p = circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(Buffer.concat(
             ints.map(x => x.leInt2Buff(32))
  )));
  return bigInt(p[0]);
}

const cutDownBits = function(b, bits) {
  let mask = bigInt(1);
  mask = mask.shl(bits).sub(bigInt(1));
  return b.and(mask);
}

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};



class SemaphoreClient {
    constructor(node_url, loaded_identity, semaphoreABI, cir_def, proving_key, verifier_key, external_nullifier, identity_index, semaphore_server_url, contract_address, from_private_key, from_address, chain_id, transaction_confirmation_blocks, server_broadcast, server_broadcast_address, logger_handler) {
        logger = logger_handler;
        this.cir_def = cir_def;

        const circuit = new snarkjs.Circuit(cir_def);
        this.circuit = circuit;

        this.vk_proof = proving_key;
        this.verifier_key = snarkjs.unstringifyBigInts(verifier_key);

        this.private_key = loaded_identity.private_key;
        this.external_nullifier = external_nullifier;
        this.node_url = node_url;
        this.semaphore_server_url = semaphore_server_url;
        this.identity_index = identity_index;

        const prvKey = Buffer.from(this.private_key, 'hex');
        const pubKey = eddsa.prv2pub(prvKey);

        this.identity_nullifier = loaded_identity.identity_nullifier;
        this.identity_trapdoor = loaded_identity.identity_trapdoor;

        this.identity_commitment = pedersenHash([bigInt(circomlib.babyJub.mulPointEscalar(pubKey, 8)[0]), bigInt(this.identity_nullifier), bigInt(this.identity_trapdoor)]);

        this.web3 = new Web3(node_url);
        this.web3.eth.transactionConfirmationBlocks = transaction_confirmation_blocks;
        logger.verbose(`transaction confirmation blocks: ${this.web3.eth.transactionConfirmationBlocks}`);
        this.contract_address = contract_address;
        this.from_private_key = from_private_key;
        this.from_address = from_address;

        this.contract = new this.web3.eth.Contract(
            semaphoreABI.abi,
            this.contract_address,
        );

        this.chain_id = chain_id;
        this.server_broadcast = server_broadcast;
    }

    async broadcast_signal(signal_str) {
        logger.info(`broadcasting signal ${signal_str}`);

        logger.verbose(`identity_commitment: ${this.identity_commitment}`);
        //const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');
        const prvKey = Buffer.from(this.private_key, 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        let external_nullifier;
        if (this.external_nullifier == 'auto') {
          const external_nullifier_from_contract = await this.contract.methods.external_nullifier().call();
          external_nullifier = bigInt(external_nullifier_from_contract.toString());
        } else {
          external_nullifier = bigInt(this.external_nullifier);
        }
        const signal_to_contract = this.web3.utils.asciiToHex(signal_str);
        const signal_to_contract_bytes = new Buffer(signal_to_contract.slice(2), 'hex');

        const signal_hash_raw = ethers.utils.solidityKeccak256(
            ['bytes'],
            [signal_to_contract_bytes],
        );
        const signal_hash_raw_bytes = new Buffer(signal_hash_raw.slice(2), 'hex');
        const signal_hash = beBuff2int(signal_hash_raw_bytes.slice(0, 31));

        const msg = mimcsponge.multiHash([external_nullifier, signal_hash]);
        const signature = eddsa.signMiMCSponge(prvKey, msg);

        assert(eddsa.verifyMiMCSponge(msg, signature, pubKey));

        const identity_nullifier = this.identity_nullifier;
        const identity_trapdoor = this.identity_trapdoor;

        let identity_path;
        if (this.identity_index === null) {
            logger.debug(`identity_index is undefined`);
            const identity_path_response = await fetch(`${this.semaphore_server_url}/path_for_element/${this.identity_commitment}`)
            identity_path = (await identity_path_response.json());
        } else {
            logger.debug(`identity_index is ${this.identity_index}`);
            const identity_path_response = await fetch(`${this.semaphore_server_url}/path/${this.identity_index}`)
            identity_path = await identity_path_response.json();
        }

        logger.debug(`identity_path: ${JSON.stringify(identity_path)}`);

        const identity_path_elements = identity_path.path_elements;
        const identity_path_index = identity_path.path_index;
        if (!identity_path_elements) {
          throw new Error(`Could not find identity ${this.identity_commitment}`);
        }

        logger.info(`calculating witness (started at ${Date.now()})`);
        const inputs = {
            'identity_pk[0]': pubKey[0],
            'identity_pk[1]': pubKey[1],
            'auth_sig_r[0]': signature.R8[0],
            'auth_sig_r[1]': signature.R8[1],
            auth_sig_s: signature.S,
            signal_hash,
            external_nullifier,
            identity_nullifier,
            identity_trapdoor,
            identity_path_elements,
            identity_path_index,
        };
        const w = this.circuit.calculateWitness(inputs);
        const witness_bin = proof_util.convertWitness(snarkjs.stringifyBigInts(w));
        const publicSignals = w.slice(1, this.circuit.nPubInputs + this.circuit.nOutputs+1);
        logger.info(`calculating witness (ended at ${Date.now()})`);

        const root = w[this.circuit.getSignalIdx('main.root')];
        const nullifiers_hash = w[this.circuit.getSignalIdx('main.nullifiers_hash')];
        assert(this.circuit.checkWitness(w));
        logger.info(`identity commitment from proof: ${w[this.circuit.getSignalIdx('main.identity_commitment.out[0]')].toString()}`);
        assert.equal(w[this.circuit.getSignalIdx('main.root')].toString(), identity_path.root);

        logger.info(`generating proof (started at ${Date.now()})`);
        const proof = await proof_util.prove(witness_bin.buffer, this.vk_proof.buffer);
        logger.info(`proof: ${JSON.stringify(stringifyBigInts(proof))}`);

        assert(snarkjs.groth.isValid(this.verifier_key, proof, publicSignals));
        logger.info(`generating proof (ended at ${Date.now()})`);

        logger.debug(`publicSignals: ${publicSignals}`);

        // publicSignals = (root, nullifiers_hash, signal_hash, external_nullifier)
        const public_signals_to_broadcast = [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ];
        const proof_to_broadcast = [
          [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
          [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
          [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
        ];

        if (this.server_broadcast) {
          const response = await fetch(`${this.semaphore_server_url}/broadcast_signal`, {
            method: 'post',
            body: JSON.stringify({
              signal: signal_to_contract,
              proof: proof_to_broadcast,
              public_signals: public_signals_to_broadcast,
            }),
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (!response.ok) {
            throw new Error(`Error, got status ${response.statusText}`);
          }
        } else {
          const encoded = await this.contract.methods.broadcastSignal(
              signal_to_contract,
              proof_to_broadcast[0],
              proof_to_broadcast[1],
              proof_to_broadcast[2],
              public_signals_to_broadcast,
          ).encodeABI();

          logger.debug('encoded: ' + encoded);
          const gas_price = '0x' + (await this.web3.eth.getGasPrice()).toString(16);
          logger.debug('gas_price: ' + gas_price);
          const gas = '0x' + (await this.web3.eth.estimateGas({
              from: this.from_address,
              to: this.contract_address,
              data: encoded
          })).toString(16);
          logger.debug('gas: ' + gas);
          const nonce = await this.web3.eth.getTransactionCount(this.from_address);
          logger.debug('nonce: ' + nonce);
          logger.debug('chain_id: ' + this.chain_id);
          const tx_object = {
              gas: gas,
              gasPrice: gas_price,
              from: this.from_address,
              to: this.contract_address,
              data: encoded,
              chainId: this.chain_id,
              nonce: nonce,
          };
          logger.debug(`tx_object: ${JSON.stringify(tx_object)}`);
          logger.debug('adding wallet');
          const wallet = await this.web3.eth.accounts.wallet.add(this.from_private_key);
          logger.debug('signing tx');
          const signed_tx = await wallet.signTransaction(tx_object, this.from_address);
          logger.info(`sending tx: ${signed_tx.messageHash}`);

          const promise = new Promise((resolve, reject) => {
            this.web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
            .on('receipt', () => {
                logger.info(`tx sent: ${signed_tx.messageHash}, gas used: ${receipt.gasUsed}`);
                resolve();
            })
            .catch((err) => {
              logger.error(`tx send error: ${JSON.stringify(err)}`);
              reject(err);
            });
          });
          await promise;
        }
    }
}

function generate_identity(logger) {

    const private_key = crypto.randomBytes(32).toString('hex');
    const prvKey = Buffer.from(private_key, 'hex');
    const pubKey = eddsa.prv2pub(prvKey);

    const identity_nullifier = '0x' + crypto.randomBytes(31).toString('hex');
    const identity_trapdoor = '0x' + crypto.randomBytes(31).toString('hex');
    logger.info(`generate identity from (private_key, public_key[0], public_key[1], identity_nullifier): (${private_key}, ${pubKey[0]}, ${pubKey[1]}, ${identity_nullifier}, ${identity_trapdoor})`);

		const identity_commitment = pedersenHash([bigInt(circomlib.babyJub.mulPointEscalar(pubKey, 8)[0]), bigInt(identity_nullifier), bigInt(identity_trapdoor)]);

    logger.info(`identity_commitment : ${identity_commitment}`);
    const generated_identity = {
        private_key,
        identity_nullifier: identity_nullifier.toString(),
        identity_trapdoor: identity_trapdoor.toString(),
        identity_commitment: identity_commitment.toString(),
    };

    return generated_identity;
}

module.exports = {
  client: SemaphoreClient,
  generate_identity,
};
