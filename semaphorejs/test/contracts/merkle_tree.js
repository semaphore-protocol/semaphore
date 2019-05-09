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