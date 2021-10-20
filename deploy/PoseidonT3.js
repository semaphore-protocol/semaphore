const { poseidon_gencontract: poseidonGenContract } = require('circomlibjs');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy("PoseidonT3", {
        from: deployer,
        log: true,
        abi: poseidonGenContract.generateABI(2),
        bytecode: poseidonGenContract.createCode(2)
    });
};
module.exports.tags = ['PoseidonT3', 'Poseidon', 'complete'];