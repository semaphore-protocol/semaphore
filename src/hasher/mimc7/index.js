const circomlib = require('circomlib');
const mimc7 = circomlib.mimc7;
const snarkjs = require('snarkjs');

const bigInt = snarkjs.bigInt;

class Mimc7Hasher {
    hash(level, left, right) {
        return mimc7.multiHash([left, right]).toString();
    }
}

module.exports = Mimc7Hasher;