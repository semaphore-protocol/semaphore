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

const RocksDb = require('../../../sbmtjs/src/storage/rocksdb');
const MerkleTree = require('../../../sbmtjs/src/tree');
const Mimc7Hasher = require('../../../sbmtjs/src/hasher/mimc7');

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};



contract('Semaphore', function () {
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

        const msg = mimc7.multiHash([external_nullifier, signal_hash]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = bigInt('230');
        const identity_r = bigInt('12311');

        const storage_path = '/tmp/rocksdb_semaphore_test';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '5';
        const storage = new RocksDb(storage_path);
        hasher = new Mimc7Hasher();
        const prefix = 'semaphore';
        const tree = new MerkleTree(
            prefix,
            storage,
            hasher,
            4,
            default_value,
        );

        const identity_commitment = mimc7.multiHash([pubKey[0], pubKey[1], identity_nullifier, identity_r]);
        await tree.update(0, identity_commitment.toString());
        const identity_path = await tree.path(0);

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
        });

        const semaphore = await Semaphore.deployed();
        await semaphore.insertIdentity(identity_commitment.toString());
        
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

        const vk_proof = unstringifyBigInts(JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/proving_key.json')).toString()));
        const {proof, publicSignals} = groth.genProof(vk_proof, w);
        await semaphore.broadcastSignal(
            signal_to_contract, 
            [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
            [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
            [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
            [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ],
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