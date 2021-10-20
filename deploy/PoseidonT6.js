const { poseidon_gencontract: poseidonGenContract } = require('circomlibjs');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy("PoseidonT6", {
        from: deployer,
        log: true,
        abi: poseidonGenContract.generateABI(5),
        bytecode: poseidonGenContract.createCode(5)
    });
};

module.exports.tags = ['PoseidonT6', 'Poseidon', 'complete'];
