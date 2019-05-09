const RocksDb = require('../../../sbmtjs/src/storage/rocksdb');
const MerkleTree = require('../../../sbmtjs/src/tree');
const Mimc7Hasher = require('../../../sbmtjs/src/hasher/mimc7');

const Web3 = require('web3');
const SemaphoreABI = require('../../build/contracts/Semaphore.json');

const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const last_block_key = 'last_block';
const state_block_key_prefix = 'state_block';
const signal_index_key = 'signal_index';
const signal_key_prefix = 'signal';

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

beInt2Buff = function(n, len) {
    let r = n;
    let o =0;
    const buff = Buffer.alloc(len);
    while ((r.greater(wBigInt.zero))&&(o<buff.length)) {
        let c = Number(r.and(wBigInt("255")));
        buff[buff.length - o - 1] = c;
        o++;
        r = r.shr(8);
    }
    if (r.greater(wBigInt.zero)) throw new Error("Number does not feed in buffer");
    return buff;
};

class SemaphoreServer {

    constructor(storage, node_url, contract_address, tree) {
        this.storage = storage;
        this.web3 = new Web3(node_url);
        this.contract_address = contract_address;
        this.tree = tree;
        this.contract = new this.web3.eth.Contract(
            SemaphoreABI.abi, 
            this.contract_address,
        );
    }

    async event_processing_loop() {
        while (true) {
            const last_processed_block = await this.get_last_processed_block();
            const current_block_number = await this.web3.eth.getBlockNumber();

            console.log(`last_processed_block: ${last_processed_block}`);
            console.log(`current_block_number: ${current_block_number}`);

            const state_root = await this.contract.methods.root().call({from: from_address}, last_processed_block);
            const state_signal_rolling_hash = await this.contract.methods.signal_rolling_hash().call({from: from_address}, last_processed_block);
            console.log(`state_root: ${state_root}, state_signal_rolling_hash: ${state_signal_rolling_hash}`);

            const saved_state_block = await this.get_state_for_block(last_processed_block);
            console.log(`saved_state_block: ${saved_state_block}`);

            if (state_root != saved_state_block.root || 
                state_signal_rolling_hash != saved_state_block.signal_rolling_hash) {
                await this.rollback_one_step();
                continue;
            }

            const target_block_number = Math.min(current_block_number, last_processed_block + 10);

            const logs = await this.web3.eth.getPastLogs({
                fromBlock: last_processed_block + 1,
                toBlock: target_block_number,
                address: this.contract_address,
            });
            console.log(logs);

            await this.save_events(
                logs, 
                state_signal_rolling_hash,
                target_block_number
            );

            if (target_block_number == current_block_number) {
                await timeout(5000);
            }
        }
    }

    async rollback_one_step(current_block) {
        while (true) {
            const state_for_block = get_state_for_block(current_block--);
            if (state_for_block.root) {
                await this.tree.rollback_to_root(state_for_block.root);
                await this.rollback_signals_to_rolling_hash(state_for_block.signal_rolling_hash);

                break;
            }
        }
    }


    async get_state_for_block(block_number) {
        return JSON.parse(await this.storage.get_or_element(`${state_block_key_prefix}_${block_number}`, '{}'));
    }

    async prepare_save_state_for_block(block_number, data) {
        return {
            key: `${state_block_key_prefix}_${block_number}`,
            value: JSON.stringify(data),
        }
    }

    async save_events(events, rolling_hash, block_number) {
        rolling_hash = bigInt(rolling_hash);

        let key_values = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            console.log(event);

            if (event.event == 'LeafAdded') {
                await tree.update(event.returnValues.leaf_index, event.returnValues.leaf);
            } else if (event.event == 'LeafUpdated') {
                await tree.update(event.returnValues.leaf_index, event.returnValues.leaf);
            } else if (event.event == 'SignalBroadcast') {
                rolling_hash = beBuff2int(crypto.createHash('sha256').update(beInt2Buff(rolling_hash), 'utf8').update(event.returnValues.signal, 'utf8').digest());
                const adds = await prepare_signal_add(
                    event.returnValues.signal,
                    event.returnValues.nullifiers_hash,
                    block_number,
                    rolling_hash,
                );
                key_values.push(adds[0]);
                key_values.push(adds[1]);
            } else {
                console.log(`Unknown event: ${event}`);
            }
        }

        key_values.push({ key: last_block_key, value: block_number.toString()});
        key_values.push(await prepare_save_state_for_block(block_number, {
            root: tree.root(),
            signal_rolling_hash: rolling_hash.toString(),
        }));
        await this.storage.put_batch(key_values);
    }

    async get_last_processed_block() {
        return parseInt(await this.storage.get_or_element(last_block_key, '0'));
    }

    async prepare_signal_add(signal, nullifiers_hash, block_number) {
        let current_index = parseInt(await this.storage.get_or_element(signal_index_key, '0'));
        current_index++;

        const signal_key = `${signal_key_prefix}_${current_index}`;
        return [{
            key: signal_key,
            value: JSON.stringify({
                signal,
                nullifiers_hash,
                block_number,
                rolling_hash,
            }),
        }, {
            key: signal_index_key,
            value: current_index,
        }];
    }

    async rollback_signals_to_rolling_hash(rolling_hash) {
        while (true) {
            let current_index = parseInt(await this.storage.get_or_element(signal_index_key, '0'));
            current_index--;
            const signal_key = `${signal_key_prefix}_${current_index}`;
            const signal_data = await this.storage.get(signal_key);
            if (signal_data.rolling_hash == rolling_hash) {
                break;
            } else {
                await this.storage.put(signal_index_key, current_index);
                await this.storage.del(signal_key);
            }
        }
    }
}

const prefix = 'semaphore';
const storage = new RocksDb(process.env.DB_PATH || 'semaphore_server.db');
const hasher = new Mimc7Hasher();
const default_value = '0';

const tree = new MerkleTree(
    prefix,
    storage,
    hasher,
    4,
    default_value,
);

const semaphore = new SemaphoreServer(
    storage,
    process.env.NODE_URL,
    process.env.CONTRACT_ADDRESS,
    tree,
);

semaphore.event_processing_loop()
.catch((err) => console.log(err));

const express = require('express');
const app = express();
const port = process.env.SEMAPHORE_PORT;

app.get('/path/:index', async (req, res) => {
    const leaf_index = req.params.index;
    res.send(await semaphore.tree.path(leaf_index));
});

const check_login = (req) => {
    return (req.header('login') == process.env.SEMAPHORE_LOGIN);
};

const from_address = process.env.FROM_ADDRESS;
const from_private_key = process.env.FROM_PRIVATE_KEY;

app.post('/add_identity', async (req, res) => {
    if (check_login) {
        const leaf = req.body.leaf;
        const encoded = await semaphore.contract.insertIdentity(leaf).encodeABI();
        const gas_price = await semaphore.web3.getGasPrice().toString(16);
        const gas = await semaphore.web3.estimateGas(encoded).toString(16);
        const tx_object = {
            gas: gas,
            gasPrice: gas_price,
            from: from_address,
            data: encoded,
        };
        const signed_tx = await semaphore.web3.eth.signTransaction(tx_object, from_private_key);
        await semaphore.web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
        res.send();
    } else {
        res.status(400).send();
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))