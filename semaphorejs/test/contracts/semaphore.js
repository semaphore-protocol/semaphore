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

const ethers = require('ethers');

const test_util = require('../../src/test_util');

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimcsponge = circomlib.mimcsponge;

const groth = snarkjs.groth;
const {unstringifyBigInts} = require('snarkjs/src/stringifybigint.js');

const assert = chai.assert;

const Semaphore = artifacts.require('Semaphore');

const proof_util = require('../../src/util');

const RocksDb = require('../../src/util/rocksdb')

const SemaphoreMerkleTree = require('semaphore-merkle-tree')
const MemStorage = SemaphoreMerkleTree.storage.MemStorage
const MerkleTree = SemaphoreMerkleTree.tree.MerkleTree
const MimcSpongeHasher = SemaphoreMerkleTree.hashers.MimcSpongeHasher


function pedersenHash(ints) {
  const p = circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(Buffer.concat(
             ints.map(x => x.leInt2Buff(32))
  )));
  return bigInt(p[0]);
}

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

const cutDownBits = function(b, bits) {
  let mask = bigInt(1);
  mask = mask.shl(bits).sub(bigInt(1));
  return b.and(mask);
}

contract('Semaphore', function (accounts) {
    let semaphore;
    let identity_commitment1;

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
        const signal_to_contract = web3.utils.asciiToHex(signal_str);
        const signal_to_contract_bytes = new Buffer(signal_to_contract.slice(2), 'hex');

        const signal_hash_raw = ethers.utils.solidityKeccak256(
            ['bytes'],
            [signal_to_contract_bytes],
        );
        const signal_hash_raw_bytes = new Buffer(signal_hash_raw.slice(2), 'hex');
        const signal_hash = beBuff2int(signal_hash_raw_bytes.slice(0, 31));

        const accounts = await web3.eth.getAccounts();

        const msg = mimcsponge.multiHash([bigInt(external_nullifier), bigInt(signal_hash)]);
        const signature = eddsa.signMiMCSponge(prvKey, msg);

        assert(eddsa.verifyMiMCSponge(msg, signature, pubKey));

        const identity_nullifier = bigInt('231');

        const storage_path = '/tmp/rocksdb_semaphore_test';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '0';
        const storage = new RocksDb(storage_path);
        const memStorage = new MemStorage();
        const hasher = new MimcSpongeHasher();
        const prefix = 'semaphore';
        const tree = new MerkleTree(
            prefix,
            storage,
            hasher,
            20,
            default_value,
        );

        const memTree = new MerkleTree(
            prefix,
            memStorage,
            hasher,
            20,
            default_value,
        );

        const identity_commitment = pedersenHash([bigInt(circomlib.babyJub.mulPointEscalar(pubKey, 8)[0]), bigInt(identity_nullifier)]);
        identity_commitment1 = identity_commitment;

        const semaphore = await Semaphore.deployed();
        const receipt = await semaphore.insertIdentity(identity_commitment.toString());
        assert.equal(receipt.logs[0].event, 'LeafAdded');
        const next_index = parseInt(receipt.logs[0].args.leaf_index.toString());

        await tree.update(next_index, identity_commitment.toString());
        await memTree.update(next_index, identity_commitment.toString());
        const identity_path = await tree.path(next_index);
        const mem_identity_path = await memTree.path(next_index);

        assert.equal(JSON.stringify(identity_path), JSON.stringify(mem_identity_path))

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
            identity_path_elements,
            identity_path_index,
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
        let failed = false;
        let reason = '';

        try {
          await semaphore.broadcastSignal(
              signal_to_contract,
              [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
              [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
              [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
              [ publicSignals[1].toString(), publicSignals[0].toString(), publicSignals[2].toString(), publicSignals[3].toString() ],
          );
        } catch(e) {
          failed = true;
          reason = e.reason
        }
        assert.equal(failed, true);
        assert.equal(reason, 'Semaphore: root not seen');

        failed = false;
        try {
          await semaphore.broadcastSignal(
              signal_to_contract,
              [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
              [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
              [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
              [ publicSignals[0].toString(), (publicSignals[1].add(bigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617'))).toString(), publicSignals[2].toString(), publicSignals[3].toString() ],
          );
        } catch(e) {
          failed = true;
          reason = e.reason
        }
        assert.equal(failed, true);
        assert.equal(reason, 'verifier-gte-snark-scalar-field');

        const a = [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ]
        const b = [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ]
        const c = [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ]
        const input = [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ]

        const check = await semaphore.preBroadcastCheck(a, b, c, input, bigInt(signal_hash).toString())
        assert.isTrue(check)

        const broadcastTx = await semaphore.broadcastSignal(
            signal_to_contract,
            a, b, c, input
        );

        assert.isTrue(broadcastTx.receipt.status)

        /*
        const evs = await semaphore.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        console.log(evs);
        */
    });

    it('tests permissioning', async () => {
        const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
        circuit = new snarkjs.Circuit(cirDef);

        const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708080001', 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const external_nullifier = bigInt('12312');
        const signal_str = 'hello!';
        const signal_to_contract = web3.utils.asciiToHex(signal_str);
        const signal_to_contract_bytes = new Buffer(signal_to_contract.slice(2), 'hex');

        const signal_hash_raw = ethers.utils.solidityKeccak256(
            ['bytes'],
            [signal_to_contract_bytes],
        );
        const signal_hash_raw_bytes = new Buffer(signal_hash_raw.slice(2), 'hex');
        const signal_hash = beBuff2int(signal_hash_raw_bytes.slice(0, 31));

        const accounts = await web3.eth.getAccounts();

        const msg = mimcsponge.multiHash([bigInt(external_nullifier), bigInt(signal_hash)]);
        const signature = eddsa.signMiMCSponge(prvKey, msg);

        assert(eddsa.verifyMiMCSponge(msg, signature, pubKey));

        const identity_nullifier = bigInt('230');

        const storage_path = '/tmp/rocksdb_semaphore_test';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '0';
        const storage = new RocksDb(storage_path);
        const memStorage = new MemStorage();
        const hasher = new MimcSpongeHasher();
        const prefix = 'semaphore';
        const tree = new MerkleTree(
            prefix,
            storage,
            hasher,
            20,
            default_value,
        );

        const memTree = new MerkleTree(
            prefix,
            memStorage,
            hasher,
            20,
            default_value,
        );


        const identity_commitment = pedersenHash([bigInt(circomlib.babyJub.mulPointEscalar(pubKey, 8)[0]), bigInt(identity_nullifier)]);

        const semaphore = await Semaphore.deployed();
        const receipt = await semaphore.insertIdentity(identity_commitment.toString());
        assert.equal(receipt.logs[0].event, 'LeafAdded');
        const next_index = parseInt(receipt.logs[0].args.leaf_index.toString());

        await tree.update(0, identity_commitment1.toString());
        await memTree.update(0, identity_commitment1.toString());
        await tree.update(next_index, identity_commitment.toString());
        await memTree.update(next_index, identity_commitment.toString());
        const identity_path = await tree.path(next_index);
        const mem_identity_path = await memTree.path(next_index);

        assert.equal(JSON.stringify(identity_path), JSON.stringify(mem_identity_path))

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
            identity_path_elements,
            identity_path_index,
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
        let failed = false;
        let reason = '';

        await semaphore.transferOwnership(accounts[1]);
        assert.equal(await semaphore.owner(), accounts[1]);

        failed = false;
        try {
          await semaphore.broadcastSignal(

              signal_to_contract,
              [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
              [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
              [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
              [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ],
          );
        } catch(e) {
          failed = true;
          reason = e.reason
        }
        assert.equal(failed, true);
        assert.equal(reason, 'Semaphore: broadcast permission denied');

        await semaphore.setPermissioning(false, { from: accounts[1] });

        const a = [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ]
        const b = [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ]
        const c = [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ]
        const input = [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ]

        const check = await semaphore.preBroadcastCheck(a, b, c, input, bigInt(signal_hash).toString())
        assert.isTrue(check)

        const broadcastTx = await semaphore.broadcastSignal(
            signal_to_contract,
            a, b, c, input
        );

        assert.isTrue(broadcastTx.receipt.status)

        /*
        const evs = await semaphore.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        console.log(evs);
        */
    });
});
