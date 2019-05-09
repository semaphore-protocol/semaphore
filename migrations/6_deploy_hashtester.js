const HashTester = artifacts.require('HashTester');

module.exports = function(deployer) {
  return deployer.then( async () =>  {
    await deployer.deploy(HashTester);
  });
};
