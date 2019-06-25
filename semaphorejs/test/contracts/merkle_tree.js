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


const MerkleTree = artifacts.require('MerkleTree');
const MerkleTreeTester = artifacts.require('MerkleTreeTester');

contract('MerkleTree', () => {
    it('tests empty tree', async function () {
        const merkletree = await MerkleTree.deployed();
        const root = await merkletree.root();
        const expectedRoot = new BN('18939887937998136589474390185940729490221012739549343669326862744498332959884', 10);
        assert.equal(root.toString(10), expectedRoot.toString(10));
    });

    it('tests insert', async function () {
        const merkletree = await MerkleTreeTester.deployed();
        await merkletree.insert_test('5');
        const root = await merkletree.root();
        const expectedRoot = new BN('1406701323482358960880977978809894610234893785434821064978317475451517385316', 10);
        assert.equal(root.toString(10), expectedRoot.toString(10));
    });
});