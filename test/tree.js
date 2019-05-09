const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const path = require('path');
const fs = require('fs');
const del = require('del');

const assert = chai.assert;

const RocksDb = require('../src/storage/rocksdb');
const MerkleTree = require('../src/tree');
const Mimc7Hasher = require('../src/hasher/mimc7');

describe('tree test', function () {
  let tree;
  let hasher;
  const default_value = '4';

  before( () => {
    const storage_path = '/tmp/rocksdb_tree_test';
    if (fs.existsSync(storage_path)) {
      del.sync(storage_path, { force: true });
    }
    const storage = new RocksDb(storage_path);
    hasher = new Mimc7Hasher();
    tree = new MerkleTree(
      storage,
      hasher,
      2,
      default_value,
    );
  });

  it('tests index', async () => {
    assert.equal(
      MerkleTree.index_to_key(5, 20),
      "tree_5_20",
    );
  });

  it('tests empty get', async () => {
    let {root, path_elements, path_index} = await tree.path(2);
    const calculated_root = hasher.hash(1,
      path_elements[1],
      hasher.hash(0, default_value, path_elements[0]),
    );
    assert.equal(root, calculated_root);
  });

  it('tests updated', async () => {
    await tree.update(0, '5');
    await tree.update(1, '6');
    await tree.update(2, '9');
    let {root, path_elements, path_index} = await tree.path(0);
    const calculated_root = hasher.hash(1,
      hasher.hash(0, '5', path_elements[0]),
      path_elements[1],
    );
    assert.equal(root, calculated_root);
    const wrong_calculated_root = hasher.hash(1,
      hasher.hash(0, '6', path_elements[0]),
      path_elements[1],
    );
    assert.notEqual(root, wrong_calculated_root);
  });

});
