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

const RocksDb = require('../util/rocksdb')
const MerkleTree = require('semaphore-merkle-tree').tree.MerkleTree
const MimcSpongeHasher = require('semaphore-merkle-tree').hashers.MimcSpongeHasher

const Web3 = require('web3');
const SemaphoreABI = require('../../build/contracts/Semaphore.json');

const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;

const crypto = require('crypto');
const winston = require('winston');

let server_config;

if (process.env.CONFIG_ENV) {
  server_config = process.env;
} else {
  server_config = require(process.env.CONFIG_PATH || './server-config.json');
}

const transaction_confirmation_blocks = parseInt(server_config.TRANSACTION_CONFIRMATION_BLOCKS) || 24;

const logger = winston.createLogger({
    level: server_config.LOG_LEVEL,
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
    while ((r.greater(bigInt.zero))&&(o<buff.length)) {
        let c = Number(r.and(bigInt("255")));
        buff[buff.length - o - 1] = c;
        o++;
        r = r.shr(8);
    }
    if (r.greater(bigInt.zero)) throw new Error("Number does not feed in buffer");
    return buff;
};

class SemaphoreServer {

    constructor(storage, node_url, contract_address, creation_hash, tree) {
        this.storage = storage;
        this.node_url = node_url;
        this.web3 = new Web3(new Web3.providers.HttpProvider(node_url));
        this.web3.eth.transactionConfirmationBlocks = transaction_confirmation_blocks;
        logger.verbose(`transaction confirmation blocks: ${this.web3.eth.transactionConfirmationBlocks}`);
        this.contract_address = contract_address;
        this.creation_hash = creation_hash;
        this.tree = tree;
        this.contract = new this.web3.eth.Contract(
            SemaphoreABI.abi,
            this.contract_address,
        );
    }

    async event_processing_loop() {
        this.creation_block = 0;
        if (this.creation_hash) {
          const creation_tx = await this.web3.eth.getTransaction(this.creation_hash);
          this.creation_block = creation_tx.blockNumber;
        }
        while (true) {
          try {
              const last_processed_block = await this.get_last_processed_block();
              const current_block_number = await this.web3.eth.getBlockNumber();

              logger.debug(`last_processed_block: ${last_processed_block}`);
              logger.debug(`current_block_number: ${current_block_number}`);

              const code = await this.web3.eth.getCode(this.contract_address, last_processed_block);
              if ( code == '0x') {
                  await this.storage.put(last_block_key, (last_processed_block + 1).toString());
                  continue;
              }

              this.identity_tree_index = await this.contract.methods.getIdTreeIndex().call({from: from_address}, last_processed_block);

              const state_root = await this.contract.methods.root(this.identity_tree_index).call({from: from_address}, last_processed_block);
              logger.debug(`state_root: ${state_root}`);

              const saved_state_block = await this.get_state_for_block(last_processed_block);
              logger.debug(`saved_state_block: ${JSON.stringify(saved_state_block)}`);

              if ( saved_state_block.root && (state_root != saved_state_block.root)) {
                  await this.rollback_one_step(last_processed_block);
                  continue;
              }

              const target_block_number = Math.min(current_block_number, last_processed_block + 10);

              const logs = await this.contract.getPastEvents('allEvents', {
                  fromBlock: last_processed_block + 1,
                  toBlock: target_block_number,
                  address: this.contract_address,
              });
              await this.save_events(
                  logs,
                  this.identity_tree_index,
                  target_block_number
              );

              if (logs.length > 0) {
                  const state_root = await this.contract.methods.root(this.identity_tree_index).call({from: from_address}, target_block_number);
                  logger.verbose(`state_root: ${state_root}`);

                  const saved_state_block = await this.get_state_for_block(target_block_number);
                  logger.verbose(`saved_state_block: ${JSON.stringify(saved_state_block)}`);
              }

              if (target_block_number == current_block_number) {
                  await timeout(5000);
              }
          } catch(e) {
            logger.error(`Error in loop: ${e.stack}`);
            await timeout(1000);

            this.web3 = new Web3(new Web3.providers.HttpProvider(this.node_url));
            this.web3.eth.transactionConfirmationBlocks = transaction_confirmation_blocks;
            this.contract = new this.web3.eth.Contract(
                SemaphoreABI.abi,
                this.contract_address,
            );
          }
        }
    }

    async rollback_one_step(current_block) {
        while (true) {
            if (current_block < 0) {
                throw new Error('cannot roll back to a negative block');
            }
            const state_for_block = this.get_state_for_block(current_block--);
            if (state_for_block.root) {
                await this.tree.rollback_to_root(state_for_block.root);

                await this.storage.put(last_block_key, current_block.toString());

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

    async save_events(events, identity_tree_index, block_number) {
        let current_index = parseInt(await this.storage.get_or_element(signal_index_key, '0'));

        let key_values = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            logger.info(`got event ${event.event} with values ${JSON.stringify(event.returnValues)}`);
            if (event.event == 'LeafAdded' && event.returnValues.tree_index == identity_tree_index) {
                await this.tree.update(event.returnValues.leaf_index, event.returnValues.leaf.toString());
            } else if (event.event == 'LeafUpdated' && event.returnValues.tree_index == identity_tree_index) {
                await this.tree.update(event.returnValues.leaf_index, event.returnValues.leaf.toString());
            } else if (event.event == 'Funded') {
            } else if (event.event == 'SignalBroadcast') {
                const signal_hash = '00' + crypto.createHash('sha256').update(event.returnValues.signal.slice(2), 'hex').digest().slice(0,31).toString('hex');

                const adds = await this.prepare_signal_add(
                    event.returnValues.signal,
                    signal_hash,
                    event.returnValues.nullifiers_hash.toString(),
                    event.returnValues.external_nullifier.toString(),
                    event.blockNumber,
                    current_index,
                );
                current_index++;
                key_values.push(adds);
            } else {
                logger.error(`Unknown event: ${JSON.stringify(event)}`);
            }
        }

        key_values.push({ key: last_block_key, value: block_number.toString()});
        key_values.push({
            key: signal_index_key,
            value: current_index,
        });
        const root = await this.tree.root();
        key_values.push(await this.prepare_save_state_for_block(block_number, {
            root,
        }));
        await this.storage.put_batch(key_values);
    }

    async get_last_processed_block() {
        return parseInt(await this.storage.get_or_element(last_block_key, this.creation_block.toString()));
    }

    async prepare_signal_add(signal, signal_hash, nullifiers_hash, external_nullifier, block_number, current_index) {
        const signal_key = `${signal_key_prefix}_${current_index}`;
        return {
            key: signal_key,
            value: JSON.stringify({
                signal,
                signal_hash,
                external_nullifier,
                nullifiers_hash,
                block_number,
                current_index,
            }),
        };
    }

}

const prefix = 'semaphore';
const storage = new RocksDb(server_config.DB_PATH || 'semaphore_server.db');
const hasher = new MimcSpongeHasher();
const default_value = '0';

const tree = new MerkleTree(
    `${prefix}_id_tree`,
    storage,
    hasher,
    20,
    default_value,
);

const semaphore = new SemaphoreServer(
    storage,
    server_config.NODE_URL,
    server_config.CONTRACT_ADDRESS,
    server_config.CREATION_HASH,
    tree,
);

semaphore.event_processing_loop()
.catch((err) => logger.error(`Semaphore error: ${err.stack}`));

const from_address = server_config.FROM_ADDRESS;
const from_private_key = server_config.FROM_PRIVATE_KEY;
const chain_id = parseInt(server_config.CHAIN_ID);

async function send_transaction(encoded, value) {
    const gas_price = '0x' + (await semaphore.web3.eth.getGasPrice()).toString(16);
    logger.verbose(`tx value: ${value}`);
    //logger.verbose('gas_price: ' + gas_price);
    const gas = '0x' + ((await semaphore.web3.eth.estimateGas({
        from: from_address,
        to: semaphore.contract_address,
        data: encoded,
        value,
    })) + 100000).toString(16);
    //logger.verbose('gas: ' + gas);
    const nonce = await semaphore.web3.eth.getTransactionCount(from_address);
    logger.verbose('nonce: ' + nonce);
    logger.verbose('chain_id: ' + chain_id);
    const tx_object = {
        gas: gas,
        gasPrice: gas_price,
        from: from_address,
        to: semaphore.contract_address,
        data: encoded,
        chainId: chain_id,
        nonce: nonce,
        value,
    };
    logger.verbose(`tx_object: ${JSON.stringify(tx_object)}`);
    logger.verbose('signing tx');
    const signed_tx = await semaphore.web3.eth.accounts.signTransaction(tx_object, from_private_key);
    logger.info(`sending tx: ${signed_tx.messageHash}`);
    logger.verbose(`sending tx object: ${JSON.stringify(signed_tx)}`);

    const promise = new Promise((resolve, reject) => {
      semaphore.web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
      .on('receipt', (receipt) => {
          logger.debug(`tx sent: ${signed_tx.messageHash}, gas used: ${receipt.gasUsed}`);
          resolve();
      })
      .catch((err) => {
        logger.error(`tx send error: ${JSON.stringify(err)}`);
        reject(err);
      });
    });
    await promise;

}

async function fund() {
  const encoded = await semaphore.contract.methods.fund().encodeABI();
  await send_transaction(encoded, '0x' +
                         bigInt(30000000000).mul(bigInt(1000))
                        .add(bigInt(50000000000).mul(bigInt(21000).add(bigInt(600000)))).mul(bigInt(10)).toString(16)
  );
}

async function disablePermissioning() {
  const encoded = await semaphore.contract.methods.setPermissioning(false).encodeABI();
  await send_transaction(encoded);
}

if (process.argv[2] == 'fund') {
  fund()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error(`error funding: ${err.stack}`);
    process.exit(1);
  });
} else if (process.argv[2] == 'disable_permissioning') {
  disablePermissioning()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error(`error funding: ${err.stack}`);
    process.exit(1);
  });
} else {
  const express = require('express');
  var cors = require('cors');

  var bodyParser = require('body-parser')

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  const port = server_config.SEMAPHORE_PORT;

  app.get('/path/:index', async (req, res) => {
      const leaf_index = req.params.index;
      const path = await semaphore.tree.path(parseInt(leaf_index));
      res.send(path);
  });

  app.get('/path_for_element/:element', async (req, res) => {
      const leaf = req.params.element;
      const leaf_index = await semaphore.tree.element_index(leaf);
      if (leaf_index < 0) {
          res.status(400).send({ error: `Element ${leaf} not found` });
          return;
      }
      const path = await semaphore.tree.path(leaf_index);
      res.send(path);
  });

  app.get('/element_index/:element', async (req, res) => {
      const leaf = req.params.element;
      const leaf_index = await semaphore.tree.element_index(leaf);
      if (leaf_index < 0) {
          res.status(400).send({ error: `Element ${leaf} not found` });
          return;
      }
      res.send({ index: leaf_index });
  });

  async function get_signals(start_index, amount, order) {
      let signals = [];

      const latest_signal_index = await semaphore.storage.get_or_element(signal_index_key, 0);
      if (order == 'asc') {
          for (let i = 0; i < amount; i++) {
              const signal_key = `${signal_key_prefix}_${start_index + i}`;
              const signal_data = JSON.parse(await semaphore.storage.get_or_element(signal_key, '{}'));
              if (signal_data.signal) {
                  signals.push(signal_data);
              }
          }
      } else if (order == 'desc') {
          for (let i = 0; i < amount; i++) {
              const signal_key = `${signal_key_prefix}_${latest_signal_index - start_index - i}`;
              const signal_data = JSON.parse(await semaphore.storage.get_or_element(signal_key, '{}'));
              if (signal_data.signal) {
                  signals.push(signal_data);
              }
          }
      } else {
          throw new Error(`Unknown order ${order}`);
      }

      const ret = {
        filtered: parseInt(latest_signal_index),
        total: parseInt(latest_signal_index),
        signals
      };

      return ret;
  }


  function convert_path(path) {
    path.root = '0x' + bigInt(path.root).toString(16);
    path.path_elements = path.path_elements.map(x => '0x' + bigInt(x).toString(16));
    return path;
  }


  app.get('/signals/:start_index/:amount/:order', async (req, res) => {
    try {
      const amount = parseInt(req.params.amount);
      if (isNaN(amount)) {
          res.status(400).send({ error: `Invalid amount ${amount}`});
          return;
      }

      const order = req.params.order;
      const start_index = parseInt(req.params.start_index);
      if (isNaN(start_index)) {
          res.status(400).send({ error: `Invalid start index ${start_index}`});
          return;
      }
      const data = await get_signals(start_index, amount, order);
      data.signals = await Promise.all(data.signals.map( async (e) => {
        e.signal = semaphore.web3.utils.toAscii(e.signal).replace(/\0/g,'');
        e.signal_hash = '0x' + e.signal_hash;
        e.nullifiers_hash = '0x' + bigInt(e.nullifiers_hash).toString(16);
        e.external_nullifier = '0x' + bigInt(e.external_nullifier).toString(16);
        e.index = '0x' + bigInt(e.current_index).toString(16);
        return e;
      }));

      res.send(data);
    } catch(err) {
      res.status(400).send({error: err.message});
    }
  });

  app.get('/signals_datatable', async (req, res) => {
    try {
      const amount = parseInt(req.query.length);
      if (isNaN(amount)) {
          res.status(400).send({ error: `Invalid amount ${amount}`});
          return;
      }

      //const order = req.query.order[0].dir;
      const order = 'asc';
      const start_index = parseInt(req.query.start) + 1;
      if (isNaN(start_index)) {
          res.status(400).send({ error: `Invalid start index ${start_index}`});
          return;
      }
      const data = await get_signals(start_index, amount, order);
      data.signals = await Promise.all(data.signals.map( async (e) => {
        e.signal = semaphore.web3.utils.toAscii(e.signal).replace(/\0/g,'');
        e.signal_hash = '0x' + e.signal_hash;
        e.nullifiers_hash = '0x' + bigInt(e.nullifiers_hash).toString(16);
        e.external_nullifier = '0x' + bigInt(e.external_nullifier).toString(16);
        e.index = '0x' + bigInt(e.current_index).toString(16);
        return e;
      }));

      res.send({
        draw: req.query.draw,
        recordsFiltered: data.filtered,
        recordsTotal: data.total,
        data: data.signals
      });
    } catch(err) {
      res.status(400).send({error: err.message});
    }
  });

  const check_login = (req) => {
      if (server_config.SEMAPHORE_LOGIN !== undefined) {
        return (req.header('login') == server_config.SEMAPHORE_LOGIN);
      } else {
        return true;
      }
  };

  app.post('/add_identity', async (req, res) => {
    try {
      logger.info(`adding identity with body: ${JSON.stringify(req.body)}`);
      if ((await check_login(req)) == true) {
          const leaf = req.body.leaf;
          const encoded = await semaphore.contract.methods.insertIdentity(leaf).encodeABI();
          //logger.verbose('encoded: ' + encoded);
          await send_transaction(encoded);

          res.json({});
      } else {
          res.status(400).json({error: 'Invalid login'});
      }
    } catch(err) {
          logger.error(err.stack);
          res.status(400).json({error: err.stack});
    }
  });

  app.post('/set_external_nullifier', async (req, res) => {
    try {
      logger.info(`setting external nullifier with body: ${JSON.stringify(req.body)}`);
      if ((await check_login(req)) == true) {
          const external_nullifier = req.body.external_nullifier;
          const encoded = await semaphore.contract.methods.setExternalNullifier(external_nullifier).encodeABI();
          //logger.verbose('encoded: ' + encoded);
          await send_transaction(encoded);

          res.json({});
      } else {
          res.status(400).json({error: 'Invalid login'});
      }
    } catch(err) {
          logger.error(err.stack);
          res.status(400).json({error: err.stack});
    }
  });

  app.post('/set_max_gas_price', async (req, res) => {
    try {
      logger.info(`setting external nullifier with body: ${JSON.stringify(req.body)}`);
      if ((await check_login(req)) == true) {
          const max_gas_price = req.body.max_gas_price;
          const encoded = await semaphore.contract.methods.setMaxGasPrice(max_gas_price).encodeABI();
          //logger.verbose('encoded: ' + encoded);
          await send_transaction(encoded);

          res.json({});
      } else {
          res.status(400).json({error: 'Invalid login'});
      }
    } catch(err) {
          logger.error(err.stack);
          res.status(400).json({error: err.stack});
    }
  });

  app.post('/broadcast_signal', async (req, res) => {
    try {
        logger.info(`broadcasting signal with body: ${JSON.stringify(req.body)}`);
        const public_signals = req.body.public_signals;
        const proof = req.body.proof;
        const signal_to_contract = req.body.signal;

        const encoded = await semaphore.contract.methods.broadcastSignal(
            signal_to_contract,
            proof[0],
            proof[1],
            proof[2],
            public_signals,
        ).encodeABI();

        await send_transaction(encoded);

        res.json({});
    } catch(err) {
        logger.error(err.stack);
        res.status(400).json({error: err.stack});
    }
  });


  process.on('unhandledRejection', function(err, promise) {
      logger.error(err.stack);
      process.exit(1);
  });

  process.on('uncaughtException', function(err) {
      logger.error(err.stack);
      process.exit(1);
  });

  app.listen(port, () => logger.verbose(`Semaphore running on port ${port}.`))
}
