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

const level = require('level-rocksdb');

class RocksDbStorage {
  constructor(path) {
    this.db = level(path);
  }

  async get(key) {
    return await this.db.get(key);
  }

  async get_or_element(key, element) {
    try {
      const ret = await this.db.get(key);
      return ret;
    } catch(err) {
      if (err.notFound) {
        return element;
      }

      throw e; 
    }
  }

  async put(key, value) {
    await this.db.put(key, value);
  }

  async del(key) {
    await this.db.del(key);
  }

  async put_batch(key_values) {
    let ops = [];
    for (var i = 0; i < key_values.length; i++) {
      ops.push(Object.assign({ type: 'put' }, key_values[i]));
    }
    await this.db.batch(ops);
  }
}

module.exports = RocksDbStorage;
