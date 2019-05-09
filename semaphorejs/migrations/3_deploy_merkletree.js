const MiMC = artifacts.require('MiMC');
const MerkleTree = artifacts.require('MerkleTree');

module.exports = function(deployer) {
  return deployer.then( async () =>  {
    await deployer.link(MiMC, MerkleTree);
    await deployer.deploy(MerkleTree, 2, 4);
  });
};
