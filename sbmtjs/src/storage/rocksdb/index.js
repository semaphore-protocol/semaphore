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
