const MiMC = artifacts.require('MiMC');
const Semaphore = artifacts.require('Semaphore');

module.exports = function(deployer) {
  return deployer.then( async () =>  {
    await deployer.link(MiMC, Semaphore);
    await deployer.deploy(Semaphore, 4, 0, 12312);
  });
};
