const { poseidon_gencontract: poseidonGenContract } = require('circomlibjs');
const { genExternalNullifier } = require('../utils');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const poseidonT3 = await deploy("PoseidonT3", {
        from: deployer,
        log: true,
        abi: poseidonGenContract.generateABI(2),
        bytecode: poseidonGenContract.createCode(2)
    });

    const poseidonT6 = await deploy("PoseidonT6", {
        from: deployer,
        log: true,
        abi: poseidonGenContract.generateABI(5),
        bytecode: poseidonGenContract.createCode(5)
    });

    const externalNullifier = genExternalNullifier('test-voting');
    const semaphore = await deploy('Semaphore', {
      from: deployer,
      log: true,
      args: [20, externalNullifier],
      libraries: {
        PoseidonT3: poseidonT3.address,
        PoseidonT6: poseidonT6.address
      }
    });

    await deploy('SemaphoreClient', {
      from: deployer,
      log: true,
      args: [semaphore.address],
    });
};
module.exports.tags = ['complete'];