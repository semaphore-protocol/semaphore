/*
 * sbmtjs - Storage-backed Merkle tree
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of sbmtjs.
 *
 * sbmtjs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * sbmtjs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with sbmtjs.  If not, see <http://www.gnu.org/licenses/>.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const path = require('path');
const uuidv4 = require('uuid/v4');

const assert = chai.assert;
const expect = chai.expect;

const RocksDb = require('../src/storage/rocksdb');

describe('db test', function () {
  before( () => {
    this.db = new RocksDb('/tmp/rocksdb_db_test');
  });
  it('tests simple put/get', async () => {
    const testkey = 'testkey';
    const rand_string = uuidv4();
    await this.db.put(testkey, rand_string);
    assert.equal(await this.db.get(testkey), rand_string);
    assert.notEqual(await this.db.get(testkey), '');
    expect(this.db.get('b')).to.be.rejected;
    assert.equal(await this.db.get_or_element('b', 5), 5);
    assert.notEqual(await this.db.get_or_element('b', 6), 5);
  });

  it('tries put batch', async () => {
    const testkey1 = 'testkey1';
    const rand_string1 = uuidv4();
    const testkey2 = 'testkey2';
    const rand_string2 = uuidv4();
    const rand_string3 = uuidv4();
    await this.db.put_batch([
      { key: testkey1, value: rand_string1 },
      { key: testkey2, value: rand_string2 },
      { key: testkey1, value: rand_string3 },
    ]);
    assert.equal(await this.db.get(testkey1), rand_string3);
    assert.equal(await this.db.get(testkey2), rand_string2);
    expect(this.db.get('testkey3')).to.be.rejected;
  });
});
