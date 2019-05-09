const Migrations = artifacts.require("Migrations");

module.exports = async (deployer) => {
  await deployer.deploy(Migrations);
};
