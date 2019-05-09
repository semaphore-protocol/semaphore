const MiMC = artifacts.require('MiMC');
const MerkleTree = artifacts.require('MerkleTreeTester');

module.exports = function(deployer) {
  return deployer.then( async () =>  {
    await deployer.link(MiMC, MerkleTree);
    await deployer.deploy(MerkleTree);
  });
};
