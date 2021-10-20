const { genExternalNullifier } = require('../utils');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    // const poseidonT3 = await hre.ethers.getContractAt("PoseidonT3")
    // const poseidonT6 = await hre.ethers.getContractAt("PoseidonT6")
    const poseidonT3 = await deployments.get("PoseidonT3")
    const poseidonT6 = await deployments.get("PoseidonT6")

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
module.exports.dependencies = ['PoseidonT3', 'PoseidonT6'];
