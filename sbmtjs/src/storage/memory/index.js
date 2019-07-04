class MemStorage {
  constructor() {
    this.db = {}
  }

  async get(key) {
    return await this.db[key]
  }

  async get_or_element(key, element) {
    if (!this.db.hasOwnProperty(key)) {
      return element
    } else {
      return await this.get(key)
    }
  }

  async put(key, value) {
    this.db[key] = value
  }

  async del(key) {
    delete this.db[key]
  }

  async put_batch(key_values) {
    for (var i = 0; i < key_values.length; i++) {
      await this.put(key_values[i].key, key_values[i].value)
    }
  }
}

module.exports = MemStorage
