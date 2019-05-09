const Migrations = artifacts.require("Migrations");

module.exports = (deployer) => {
  return deployer.then( async () =>  {
    await deployer.deploy(Migrations);
  });
};
