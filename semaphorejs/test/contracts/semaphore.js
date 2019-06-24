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

const BN = require('bn.js');
const chai = require('chai');

const crypto = require('crypto');
const fs = require('fs');
const del = require('del');
const path = require('path');

const snarkjs = require('snarkjs');
const circomlib = require('circomlib');

const test_util = require('../../src/test_util');

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimc7 = circomlib.mimc7;

const groth = snarkjs.groth;
const {unstringifyBigInts} = require('snarkjs/src/stringifybigint.js');

const assert = chai.assert;

const Semaphore = artifacts.require('Semaphore');

const proof_util = require('../../src/util');

const RocksDb = require('zkp-sbmtjs/src/storage/rocksdb');
const MerkleTree = require('zkp-sbmtjs/src/tree');
const Mimc7Hasher = require('zkp-sbmtjs/src/hasher/mimc7');

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

contract('Semaphore', function (accounts) {
    let semaphore;

    before(async () => {
        semaphore = await Semaphore.deployed();
    })

    it('semaphore belongs to the correct owner', async () => {
        assert.equal(await semaphore.owner(), accounts[0]);
    })

    it('tests proof', async () => {
        const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
        circuit = new snarkjs.Circuit(cirDef);

        const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const external_nullifier = bigInt('12312');
        const signal_str = 'hello!';
        const signal_hash_raw = crypto.createHash('sha256').update(signal_str, 'utf8').digest();
        const signal_hash = beBuff2int(signal_hash_raw.slice(0, 31));
        const signal_to_contract = web3.utils.asciiToHex(signal_str);
        const accounts = await web3.eth.getAccounts();
        const broadcaster_address = bigInt(accounts[0].toString());

        const msg = mimc7.multiHash([bigInt(external_nullifier), bigInt(signal_hash), bigInt(broadcaster_address)]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = bigInt('230');
        const identity_r = bigInt('12311');

        const storage_path = '/tmp/rocksdb_semaphore_test';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '0';
        const storage = new RocksDb(storage_path);
        const hasher = new Mimc7Hasher();
        const prefix = 'semaphore';
        const tree = new MerkleTree(
            prefix,
            storage,
            hasher,
            20,
            default_value,
        );

        const identity_commitment = mimc7.multiHash([bigInt(pubKey[0]), bigInt(pubKey[1]), bigInt(identity_nullifier), bigInt(identity_r)]);
        const semaphore = await Semaphore.deployed();
        const receipt = await semaphore.insertIdentity(identity_commitment.toString());
        assert.equal(receipt.logs[0].event, 'LeafAdded');
        const next_index = parseInt(receipt.logs[0].args.leaf_index.toString());
        await semaphore.fund({value: web3.utils.toWei('10')});

        await tree.update(next_index, identity_commitment.toString());
        const identity_path = await tree.path(next_index);

        const identity_path_elements = identity_path.path_elements;
        const identity_path_index = identity_path.path_index;

        //console.log(identity_commitment.toString());
        //console.log(identity_path_elements, identity_path_index, identity_path.root);

        const w = circuit.calculateWitness({
            'identity_pk[0]': pubKey[0],
            'identity_pk[1]': pubKey[1],
            'auth_sig_r[0]': signature.R8[0],
            'auth_sig_r[1]': signature.R8[1],
            auth_sig_s: signature.S,
            signal_hash,
            external_nullifier,
            identity_nullifier,
            identity_r,
            identity_path_elements,
            identity_path_index,
            broadcaster_address,
        });

        const root = w[circuit.getSignalIdx('main.root')];
        const nullifiers_hash = w[circuit.getSignalIdx('main.nullifiers_hash')];
        assert(circuit.checkWitness(w));
        assert.equal(w[circuit.getSignalIdx('main.root')].toString(), identity_path.root);

        //console.log(w[circuit.getSignalIdx('main.root')]);

        /*
        console.log(tree[0]);
        console.log(w[circuit.getSignalIdx('main.signal_hash')]);
        console.log(w[circuit.getSignalIdx('main.external_nullifier')]);
        console.log(w[circuit.getSignalIdx('main.root')]);
        console.log(w[circuit.getSignalIdx('main.nullifiers_hash')]);
        console.log(w[circuit.getSignalIdx('main.identity_commitment.out')]);
        */

        const vk_proof = fs.readFileSync(path.join(__dirname,'../../build/proving_key.bin'));
        const witness_bin = proof_util.convertWitness(snarkjs.stringifyBigInts(w));
        const publicSignals = w.slice(1, circuit.nPubInputs + circuit.nOutputs+1);
        const proof = await proof_util.prove(witness_bin.buffer, vk_proof.buffer);
        await semaphore.broadcastSignal(
            signal_to_contract,
            [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
            [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
            [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
            [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString(), publicSignals[4].toString() ],
        );

        /*
        const evs = await semaphore.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        console.log(evs);
        */
    });
});
