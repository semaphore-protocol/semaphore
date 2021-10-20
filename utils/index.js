const { ethers } = require('ethers');

const genExternalNullifier = (plaintext) => {
    const _cutOrExpandHexToBytes = (hexStr, bytes) => {
        const len = bytes * 2;

        const h = hexStr.slice(2, len + 2);
        return "0x" + h.padStart(len, "0");
    };

    const hashed = ethers.utils.solidityKeccak256(["string"], [plaintext]);
    return _cutOrExpandHexToBytes("0x" + hashed.slice(8), 32);
};

module.exports = { genExternalNullifier }