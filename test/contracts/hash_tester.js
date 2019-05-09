const crypto = require('crypto');
const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;
const HashTester = artifacts.require('HashTester');
const Web3 = require('web3');

const chai = require('chai');
const assert = chai.assert;

beBuff2int = function(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

beInt2Buff = function(n, len) {
    let r = n;
    let o =0;
    const buff = Buffer.alloc(len);
    while ((r.greater(bigInt.zero))&&(o<buff.length)) {
        let c = Number(r.and(bigInt("255")));
        buff[buff.length - o - 1] = c;
        o++;
        r = r.shr(8);
    }
    if (r.greater(bigInt.zero)) throw new Error("Number does not feed in buffer");
    return buff;
};

contract('HashTester', () => {

    it('tests hash', async () => {
        const web3_local = new Web3('http://localhost:7545');
        const test_str = 'lol';
        const tester = await HashTester.deployed();
        const test_to_contract = await web3_local.utils.asciiToHex(test_str);
        const test_hash_raw = crypto.createHash('sha256').update(test_to_contract.slice(2), 'hex').digest();
        const test_hash = bigInt.leBuff2int(test_hash_raw.slice(0, 31)).toString();
        const test_hash_be = beBuff2int(test_hash_raw.slice(0, 31)).toString();
        //console.log(test_hash);
        //console.log(test_hash_be);
        await tester.Test(test_to_contract);
        await tester.Test(test_to_contract);
        const evs = await tester.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        console.log(beInt2Buff(bigInt(1238129381923), 32).toString('hex'));
        console.log('00' + crypto.createHash('sha256').update(test_to_contract.slice(2), 'hex').digest().slice(0,31).toString('hex'));
        const rolling_hash = beBuff2int(
                    crypto.createHash('sha256').update(beInt2Buff(bigInt(1238129381923), 32)).update(
                        ('00' + crypto.createHash('sha256').update(test_to_contract.slice(2), 'hex').digest().slice(0,31).toString('hex')), 'hex'
                    ).digest()
        );

        //console.log(evs);
        console.log(beBuff2int(crypto.createHash('sha256').update('0000000000000000000000000000000000000000000000000000012046431223005d6923d827ebe0f2db3a1ac59d6b50a171ec52bcb956f1a3285354487426d4', 'hex').digest()).toString());
        console.log(rolling_hash);

        assert.equal(evs[0].returnValues[3], test_hash_be);
    });
});