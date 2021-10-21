const { poseidon_gencontract: poseidonGenContract } = require('circomlibjs');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployTx = (x) => {
        return {
            from: deployer,
            log: true,
            abi: poseidonGenContract.generateABI(x),
            bytecode: poseidonGenContract.createCode(x)
        }
    }

    await deploy("PoseidonT3", deployTx(2));
    await deploy("PoseidonT6", deployTx(5));
};
module.exports.tags = ['Poseidon', 'complete'];