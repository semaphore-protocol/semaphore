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

const winston = require('winston');

const SemaphoreABI = require('../../build/contracts/Semaphore.json');

const generated_identity_path = process.env.IDENTITY_PATH || 'semaphore_identity.json';


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

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

class SemaphoreClient {
    constructor(node_url, stored_identity_path, external_nullifier, identity_index, semaphore_server_url, contract_address, from_private_key, from_address, chain_id) {
        let loaded_identity;
        if (fs.existsSync(stored_identity_path)) {
            loaded_identity = JSON.parse(fs.readFileSync(stored_identity_path));
        } else {
            throw new Error(`cannot find stored identity in ${stored_identity_path}`);
        }
        const cirDef = JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/circuit.json')).toString());
        this.cir_def = cirDef;

        const circuit = new snarkjs.Circuit(cirDef);
        this.circuit = circuit;

        const vk_proof = unstringifyBigInts(JSON.parse(fs.readFileSync(path.join(__dirname,'../../build/proving_key.json')).toString()));
        this.vk_proof = vk_proof;

        this.private_key = loaded_identity.private_key;
        this.external_nullifier = external_nullifier;
        this.node_url = node_url;
        this.semaphore_server_url = semaphore_server_url;
        this.identity_index = identity_index;

        const prvKey = Buffer.from(this.private_key, 'hex');
        const pubKey = eddsa.prv2pub(prvKey);

        this.identity_nullifier = loaded_identity.identity_nullifier;
        this.identity_r = loaded_identity.identity_r;

        this.identity_commitment = mimc7.multiHash([pubKey[0], pubKey[1], this.identity_nullifier, this.identity_r]);

        this.web3 = new Web3(node_url);
        this.web3.eth.transactionConfirmationBlocks = 24;
        this.contract_address = contract_address;
        this.from_private_key = from_private_key;
        this.from_address = from_address;

        this.contract = new this.web3.eth.Contract(
            SemaphoreABI.abi, 
            this.contract_address,
        );

        this.chain_id = chain_id;
    }

    async broadcast_signal(signal_str) {
        logger.info(`broadcasting signal ${signal_str}`);
        //const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');
        const prvKey = Buffer.from(this.private_key, 'hex');

        const pubKey = eddsa.prv2pub(prvKey);

        const external_nullifier = bigInt(this.external_nullifier);
        const signal_to_contract = this.web3.utils.asciiToHex(signal_str);
        const signal_hash_raw = crypto.createHash('sha256').update(signal_to_contract.slice(2), 'hex').digest();
        const signal_hash = beBuff2int(signal_hash_raw.slice(0, 31));

        const msg = mimc7.multiHash([external_nullifier, signal_hash]);
        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const identity_nullifier = this.identity_nullifier;
        const identity_r = this.identity_r;

        let identity_path;
        if (this.identity_index === undefined) {
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

        logger.info(`calculating witness (started at ${Date.now()})`);
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
        logger.info(`calculating witness (ended at ${Date.now()})`);

        
        const root = w[this.circuit.getSignalIdx('main.root')];
        const nullifiers_hash = w[this.circuit.getSignalIdx('main.nullifiers_hash')];
        assert(this.circuit.checkWitness(w));
        assert.equal(w[this.circuit.getSignalIdx('main.root')].toString(), identity_path.root);

        logger.info(`generating proof (started at ${Date.now()})`);
        const {proof, publicSignals} = groth.genProof(this.vk_proof, w);
        logger.info(`generating proof (ended at ${Date.now()})`);

        logger.debug(`publicSignals: ${publicSignals}`);

        const encoded = await this.contract.methods.broadcastSignal(
            signal_to_contract, 
            [ proof.pi_a[0].toString(), proof.pi_a[1].toString() ],
            [ [ proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString() ], [ proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString() ] ],
            [ proof.pi_c[0].toString(), proof.pi_c[1].toString() ],
            [ publicSignals[0].toString(), publicSignals[1].toString(), publicSignals[2].toString(), publicSignals[3].toString() ]
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
        this.web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
        .on('receipt', () => {
            logger.debug(`tx sent: ${signed_tx.messageHash}`);
        })
        .catch((err) => logger.error(`tx send error: ${err.message}`));
    }
}




process.on('unhandledRejection', function(err, promise) {
    logger.error(err.message);
    process.exit(1);
});

process.on('uncaughtException', function(err) {
    logger.error(err.message);
    process.exit(1);
});

function generate_identity() {
    const private_key = crypto.randomBytes(32).toString('hex');
    const prvKey = Buffer.from(private_key, 'hex');
    const pubKey = eddsa.prv2pub(prvKey);

    const identity_nullifier = '0x' + crypto.randomBytes(31).toString('hex');
    const identity_r = '0x' + crypto.randomBytes(31).toString('hex');
    logger.info(`generate identity from (private_key, identity_nullifier, identity_r): (${private_key}, ${identity_nullifier}, ${identity_r})`);

    const identity_commitment = mimc7.multiHash([pubKey[0], pubKey[1], identity_nullifier, identity_r]);

    logger.info(`identity_commitment : ${identity_commitment}`);
    fs.writeFileSync(generated_identity_path, JSON.stringify({
        private_key,
        identity_nullifier: identity_nullifier.toString(),
        identity_r: identity_r.toString(),
        identity_commitment: identity_commitment.toString(),
    }));
}



switch(process.argv[2]) {
case 'generate_identity':
generate_identity();
break;

case 'signal':
if (process.argv.length < 4) {
    throw new Error('cannot send an empty signal');
}
const semaphore = new SemaphoreClient(
    process.env.NODE_URL,
    generated_identity_path,
    process.env.EXTERNAL_NULLIFIER,
    process.env.IDENTITY_INDEX,
    process.env.SEMAPHORE_SERVER_URL,
    process.env.CONTRACT_ADDRESS,
    process.env.FROM_PRIVATE_KEY,
    process.env.FROM_ADDRESS,
    parseInt(process.env.CHAIN_ID),
);
semaphore.broadcast_signal(process.argv[3]);
break;
}