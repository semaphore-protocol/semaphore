import * as Artifactor from 'truffle-artifactor'
const mimcGenContract = require('circomlib/src/mimcsponge_gencontract.js');
const artifactor = new Artifactor('compiled/')
const SEED = 'mimcsponge'

const buildMiMC = async () => {
    await artifactor.save({
        contractName: 'MiMC',
        abi: mimcGenContract.abi,
        unlinked_binary: mimcGenContract.createCode(SEED, 220),
    })
}

if (require.main === module) {
    buildMiMC()
}

export default buildMiMC
