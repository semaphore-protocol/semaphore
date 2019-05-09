const MiMC = artifacts.require("MiMC");
const Semaphore = artifacts.require("Semaphore");

module.exports = async function(deployer) {
  deployer.link(MiMC, Semaphore);
  await deployer.deploy(Semaphore);
};
