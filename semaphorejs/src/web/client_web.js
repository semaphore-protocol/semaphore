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
const {unstringifyBigInts, stringifyBigInts} = require('snarkjs/src/stringifybigint.js');
const Web3 = require('web3');

const chai = require('chai');
const assert = chai.assert;

const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;

const eddsa = require('circomlib/src/eddsa');
const mimc7 = require('circomlib/src/mimc7');

const groth = snarkjs.groth;

const fetch = require('node-fetch');
var FileSaver = require('file-saver');

const SemaphoreModules = require('./semaphore.js');
const SemaphoreClient = SemaphoreModules.client;
const generate_identity = SemaphoreModules.generate_identity;

const logger = {
    info: (msg) => console.log(`INFO: ${msg}`),
    error: (msg) => console.log(`ERRROR: ${msg}`),
    debug: (msg) => console.log(`DEBUG: ${msg}`),
    verbose: (msg) => console.log(`VERBOSE: ${msg}`),
};

let web3js;
let semaphore_contract;

  /*
  const loaded_identity = {
    "private_key": "991d5bfeb44c137bb84055981bbd0b1b36076183ac048918496dfdef54ea054c",
    "identity_nullifier":"0x0fd6fb484890f9c31f3dac0a1046db476b275e2dd44dd19351f06e43cb4a71",
    "identity_r":"0x8b235145c1605b0473d2d215a62a9f60b6e37b901e6a00d9be88cde0b3b128",
    "identity_commitment":"17125566502705933915404206431340929706290352994945609284190202229100755467605"
  };
  */


const SemaphoreABI = require('../../build/contracts/Semaphore.json');

(async () => {
  //window.semaphore = semaphore;
  window.broadcast = async function(signal_str, identity) {
    const cir_def = await (await fetch('circuit.json')).json();
    const proving_key = Buffer.from(await (await fetch('proving_key.bin')).arrayBuffer());
    const verification_key = await (await fetch('verification_key.json')).json();

    /*
    const semaphore = new SemaphoreClient(
      'http://localhost:7545',
      identity,
      SemaphoreABI,
      cir_def,
      proving_key,
      verification_key,
      '12312',
      null,
      'http://localhost:3000',
      '0x11E3721477C144a6285fA259f0e379188C0a3A50',
      '0x6738837df169e8d6ffc6e33a2947e58096d644fa4aa6d74358c8d9d57c12cd21',
      '0x1929c15f4e818abf2549510622a50c440c474223',
      5777,
      1,
      logger,
    );
    */
    let external_nullifier = $('#f_external_nullifier').val();
    if (external_nullifier === 'auto') {
      external_nullifier = await semaphore_contract.methods.external_nullifier().call();
    }

    const semaphore = new SemaphoreClient(
      $('#f_node_url').val(),
      identity,
      SemaphoreABI,
      cir_def,
      proving_key,
      verification_key,
      external_nullifier,
      null,
      $('#f_semaphore_server_url').val(),
      $('#f_semaphore_contract_address').val(),
      $('#f_from_private_key').val(),
      $('#f_from_address').val(),
      parseInt($('#f_chain_id').val()),
      parseInt($('#f_tx_confirm').val()),
      true,
      $('#f_semaphore_server_address').val(),
      logger,
    );
    await semaphore.broadcast_signal(signal_str);
  };

  window.verify_row = function (row, data, index) {
      let current_hash = data.signal_hash;
      let left;
      let right;
      for (let i = 0; i < data.path.path_elements.length; i++) {
        if (data.path.path_index[i] == 0) {
          left = current_hash;
          right = data.path.path_elements[i];
        } else {
          left = data.path.path_elements[i];
          right = current_hash;
        }
        current_hash = bigInt(mimc7.multiHash([bigInt(left), bigInt(right)]));
      }
      const expected_root = '0x' + current_hash.toString(16);
      const signals_root = $('#s_signals_root').text();
      if (expected_root != signals_root) {
        $(row).addClass('verify-error');
      } else {
        $(row).addClass('verify-ok');
      }
  };

  async function update_state() {
    $('#s_block_number').text(await web3js.eth.getBlockNumber());
    $('#s_root').text('0x' + bigInt(await semaphore_contract.methods.roots(0).call()).toString(16));
    const signals_root = await semaphore_contract.methods.roots(1).call();
    $('#s_signals_root').text('0x' + bigInt(signals_root).toString(16));
    $('#s_external_nullifier').text('0x' + bigInt(await semaphore_contract.methods.external_nullifier().call()).toString(16));
    $('#s_gas_price_max').text(await semaphore_contract.methods.gas_price_max().call());
    if (window.table_inited) {
      window.signals_table.ajax.reload(null, false);
    }
  }

  window.connect = async function() {
    web3js = new Web3($('#f_node_url').val());
    semaphore_contract = new web3js.eth.Contract(SemaphoreABI.abi, $('#f_semaphore_contract_address').val());
    window.web3js = web3js;
    window.semaphore_contract = semaphore_contract;
    web3js.eth.subscribe('newBlockHeaders', null, async (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      await update_state();
    });
    semaphore_contract.events.allEvents(null, async () => {
    });
    await update_state();
    window.signals_table = $('#signals').DataTable({
        "searching": false,
        "processing": true,
        "serverSide": true,
        "ajax": $('#f_semaphore_server_url').val() + "/signals_datatable",
        "createdRow": window.verify_row,
				"columnDefs": [
					{ "orderable": true, "targets": 0 }
				],
        "columns": [
            { "data": "signal" },
            { "data": "nullifiers_hash" },
            { "data": "external_nullifier" },
            { "data": "block_number" },
        ]
    });
    window.table_inited = true;
  };
  $('#btn_connect').click(window.connect);

  $('#btn_broadcast').click(async () => {
    try {
      $('#d_status').text('Broadcasting...');
      $('#d_broadcasting').show();
      await window.broadcast($('#b_signal').val(), window.generated);
      $('#d_status').text('Broadcast successful.');
      $('#d_broadcasting').hide();
    } catch(e) {
      $('#d_status').text(e.message);
      $('#d_broadcasting').hide();
    }
  });

  $('#btn_add_identity').click(async () => {
    try {
      $('#d_status').text('Adding identity...');
      const semaphore_server_url = $('#f_semaphore_server_url').val();
      const response = await fetch(`${semaphore_server_url}/add_identity`, {
        method: 'post',
        body: JSON.stringify({
          leaf: $('#a_comm').val()
        }),
        headers: {
          'Content-Type': 'application/json',
          login: $('#a_login').val()
        }
      });
      if (!response.ok) {
        throw new Error(`Error, got status ${response.statusText}`);
      }
      $('#d_status').text('Adding identity successful.');
    } catch(e) {
      $('#d_status').text(e.message);
    }
  });

  $('#btn_set_ex_null').click(async () => {
    try {
      $('#d_status').text('Setting external nullifier...');
      const semaphore_server_url = $('#f_semaphore_server_url').val();
      const response = await fetch(`${semaphore_server_url}/set_external_nullifier`, {
        method: 'post',
        body: JSON.stringify({
          external_nullifier: $('#a_ex_null').val()
        }),
        headers: {
          'Content-Type': 'application/json',
          login: $('#a_login').val()
        }
      });
      if (!response.ok) {
        throw new Error(`Error, got status ${response.statusText}`);
      }
      $('#d_status').text('Setting external nullifier successful.');
    } catch(e) {
      $('#d_status').text(e.message);
    }
  });

  $('#btn_set_max_gas_price').click(async () => {
    try {
      $('#d_status').text('Setting max gas price...');
      const semaphore_server_url = $('#f_semaphore_server_url').val();
      const response = await fetch(`${semaphore_server_url}/set_max_gas_price`, {
        method: 'post',
        body: JSON.stringify({
          max_gas_price: $('#a_max_gas_price').val()
        }),
        headers: {
          'Content-Type': 'application/json',
          login: $('#a_login').val()
        }
      });
      if (!response.ok) {
        throw new Error(`Error, got status ${response.statusText}`);
      }
      $('#d_status').text('Setting max gas price successful.');
    } catch(e) {
      $('#d_status').text(e.message);
    }
  });



  window.download = function(text, name, type) {
    var blob = new Blob([text], {type: 'application/json;charset=utf-8'});
    FileSaver.saveAs(blob, name);
  }


  window.generate_identity = generate_identity;
  window.logger = logger;
  window.display_identity = () => {
    $('#d_identity').text(JSON.stringify(window.generated, null, 2))
  };
})();
