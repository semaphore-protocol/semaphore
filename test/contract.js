const TestRPC = require("ganache-cli");
const Web3 = require("web3");
const chai = require("chai");
const mimcGenContract = require("circomlib/src/mimc_gencontract.js");
const mimcjs = require("circomlib/src/mimc7.js");


const assert = chai.assert;
const log = (msg) => { if (process.env.MOCHA_VERBOSE) console.log(msg); };

const SEED = "mimc";

describe("MiMC Smart contract test", () => {
    let testrpc;
    let web3;
    let mimc;
    let accounts;

    before(async () => {
        testrpc = TestRPC.server({
            ws: true,
            gasLimit: 5800000,
            total_accounts: 10,
        });

        testrpc.listen(8546, "127.0.0.1");

        web3 = new Web3("ws://127.0.0.1:8546");
        accounts = await web3.eth.getAccounts();
    });

    after(async () => testrpc.close());

    it("Should deploy the contract", async () => {
        const C = new web3.eth.Contract(mimcGenContract.abi);

        mimc = await C.deploy({
            data: mimcGenContract.createCode(SEED, 91)
        }).send({
            gas: 1500000,
            from: accounts[0]
        });
    });

    it("Shold calculate the mimic correctly", async () => {
        const res = await mimc.methods.MiMCpe7(1,2).call();
        const res2 = await mimcjs.hash(1,2,91);

        assert.equal(res.toString(), res2.toString());
    });
});
