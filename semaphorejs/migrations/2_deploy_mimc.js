/*
 * semaphorejs - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of semaphorejs.
 *
 * semaphorejs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * semaphorejs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
 */

const path = require('path');

const mimcGenContract = require('circomlib/src/mimc_gencontract.js');
const Artifactor = require('truffle-artifactor');

const SEED = 'mimc';


module.exports = function(deployer) {
  return deployer.then( async () =>  {
    const contractsDir = path.join(__dirname, '..', 'build/contracts');
    let artifactor = new Artifactor(contractsDir);
    let mimcContractName = 'MiMC';
    await artifactor.save({
      contractName: mimcContractName,
      abi: mimcGenContract.abi,
      unlinked_binary: mimcGenContract.createCode(SEED, 91),
    })
    .then(async () => {
      const MiMC = artifacts.require(mimcContractName);
      await deployer.deploy(MiMC);
    });
  });
};
