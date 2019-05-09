const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const chai = require('chai');
const assert = chai.assert;

const snarkjs = require('snarkjs');
const circomlib = require('circomlib');

const bigInt = snarkjs.bigInt;

const eddsa = circomlib.eddsa;
const mimc7 = circomlib.mimc7;

const groth = snarkjs.groth;
const {unstringifyBigInts} = require('snarkjs/src/stringifybigint.js');

const fetch = require("node-fetch");

const Web3 = require('web3');

const SemaphoreABI = require('../../build/contracts/Semaphore.json');

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

class SemaphoreClient {
    constructor(node_url, private_key, external_nullifier, identity_index, identity_nullifier, identity_r, semaphore_server_url, contract_address, from_private_key, from_address, chain_id) {
        const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
        this.cir_def = cirDef;

        const circuit = new snarkjs.Circuit(cirDef);
        this.circuit = circuit;

        const vk_proof = unstringifyBigInts(JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/proving_key.json')).toString()));
        this.vk_proof = vk_proof;

        this.private_key = private_key;
        this.external_nullifier = external_nullifier;
        this.node_url = node_url;
        this.semaphore_server_url = semaphore_server_url;
        this.identity_index = identity_index;

        const prvKey = Buffer.from(this.private_key, 'hex');
        const pubKey = eddsa.prv2pub(prvKey);

        this.identity_nullifier = identity_nullifier;
        this.identity_r = identity_r;

        this.identity_commitment = mimc7.multiHash([pubKey[0], pubKey[1], identity_nullifier, identity_r]);

        this.web3 = new Web3(node_url);
        this.contract_address = contract_address;
        this.from_private_key = from_private_key;
        this.from_address = from_address;

        this.contract = new this.web3.eth.Contract(
            SemaphoreABI.abi, 
            this.contract_address,
        );

        this.chain_id = chain_id;
    }

    async print_commitment() {
        console.log(`identity_commitment: ${this.identity_commitment}`);
    }

    async broadcast_signal(signal_str) {
        //const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');
        const prvKey = Buffer.from(this.private_key, 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const external_nullifier = bigInt(this.external_nullifier);
        const signal_hash_raw = crypto.createHash('sha256').update(signal_str, 'utf8').digest();
        const signal_hash = bigInt.leBuff2int(signal_hash_raw.slice(0, 31));
        const signal_to_contract = this.web3.utils.asciiToHex(signal_str);

        const msg = mimc7.multiHash([external_nullifier, signal_hash]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = this.identity_nullifier;
        const identity_r = this.identity_r;

        const identity_path_response = await fetch(`${this.semaphore_server_url}/path/${this.identity_index}`)
        const identity_path = await identity_path_response.json();
        console.log(identity_path);

        const identity_path_elements = identity_path.path_elements;
        const identity_path_index = identity_path.path_index;

        //console.log(identity_commitment.toString());
        //console.log(identity_path_elements, identity_path_index, identity_path.root);

        const w = this.circuit.calculateWitness({
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

        
        const root = w[this.circuit.getSignalIdx('main.root')];
        const nullifiers_hash = w[this.circuit.getSignalIdx('main.nullifiers_hash')];
        assert(this.circuit.checkWitness(w));
        assert.equal(w[this.circuit.getSignalIdx('main.root')].toString(), identity_path.root);

        const {proof, publicSignals} = groth.genProof(this.vk_proof, w);

        console.log(publicSignals);

        const encoded = await this.contract.methods.broadcastSignal(
            signal_to_contract, 
            [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
            [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
            [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
            [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ]
        ).encodeABI();

        console.log('encoded: ' + encoded);
        const gas_price = '0x' + (await this.web3.eth.getGasPrice()).toString(16);
        console.log('gas_price: ' + gas_price);
        const gas = '0x' + (await this.web3.eth.estimateGas({
            from: this.from_address,
            to: this.contract_address,
            data: encoded
        })).toString(16);
        console.log('gas: ' + gas);
        const nonce = await this.web3.eth.getTransactionCount(this.from_address);
        console.log('nonce: ' + nonce);
        console.log('chain_id: ' + this.chain_id);
        const tx_object = {
            gas: gas,
            gasPrice: gas_price,
            from: this.from_address,
            to: this.contract_address,
            data: encoded,
            chainId: this.chain_id,
            nonce: nonce,
        };
        console.log(JSON.stringify(tx_object));
        const wallet = await this.web3.eth.accounts.wallet.add(this.from_private_key);
        const signed_tx = await wallet.signTransaction(tx_object, this.from_address);
        await semaphore.web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
    }
}

const semaphore = new SemaphoreClient(
    process.env.NODE_URL,
    process.env.PRIVATE_KEY,
    process.env.EXTERNAL_NULLIFIER,
    process.env.IDENTITY_INDEX,
    process.env.IDENTITY_NULLIFIER,
    process.env.IDENTITY_R,
    process.env.SEMAPHORE_SERVER_URL,
    process.env.CONTRACT_ADDRESS,
    process.env.FROM_PRIVATE_KEY,
    process.env.FROM_ADDRESS,
    parseInt(process.env.CHAIN_ID),
);

switch(process.argv[2]) {
    case 'commitment':
    semaphore.print_commitment();
    break;

    case 'signal':
    semaphore.broadcast_signal(process.argv[3]);
    break;
}
