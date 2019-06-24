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

const assert = chai.assert;

const fs = require('fs');
const del = require('del');
const path = require('path');

const MerkleTree = artifacts.require('MerkleTree');
const MerkleTreeTester = artifacts.require('MerkleTreeTester');

const RocksDb = require('zkp-sbmtjs/src/storage/rocksdb');
const MerkleTreeLib = require('zkp-sbmtjs/src/tree');
const Mimc7Hasher = require('zkp-sbmtjs/src/hasher/mimc7');



contract('MerkleTree', () => {
    it('tests empty tree', async function () {
        const storage_path = '/tmp/rocksdb_semaphore_test';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '4';
        const storage = new RocksDb(storage_path);
        const hasher = new Mimc7Hasher();
        const prefix = 'semaphore';
        const tree = new MerkleTreeLib(
            prefix,
            storage,
            hasher,
            2,
            default_value,
        );

        const merkletree = await MerkleTree.deployed();
        const root = await merkletree.root();
        const tree_root = await tree.root();
        assert.equal(root.toString(10), tree_root.toString());
    });

    it('tests insert', async function () {
        const storage_path = '/tmp/rocksdb_semaphore_test2';
        if (fs.existsSync(storage_path)) {
            del.sync(storage_path, { force: true });
        }
        const default_value = '4';
        const storage = new RocksDb(storage_path);
        const hasher = new Mimc7Hasher();
        const prefix = 'semaphore';
        const tree = new MerkleTreeLib(
            prefix,
            storage,
            hasher,
            2,
            default_value,
        );

        const merkletree = await MerkleTreeTester.deployed();
        await merkletree.insert_test('5');
        tree.update(0, '5');
        const root = await merkletree.root();
        const tree_root = await tree.root();
        assert.equal(root.toString(10), tree_root.toString());
    });
});
