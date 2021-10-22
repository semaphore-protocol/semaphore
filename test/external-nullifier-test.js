const { expect } = require("chai");
const { ethers } = require('hardhat');
const { poseidon_gencontract: poseidonGenContract } = require("circomlibjs");
const { genExternalNullifier } = require("@libsem/protocols");


const deployPoseidonTx = (x) => {
    return ethers.getContractFactory(
        poseidonGenContract.generateABI(x),
        poseidonGenContract.createCode(x)
    )
}
let semaphore;
let defaultExternalNullifier;
let newExternalNullifier;


before("*", async () => {
    defaultExternalNullifier = genExternalNullifier("voting_1");
    newExternalNullifier = genExternalNullifier('voting-2');

    const PoseidonT3 = await deployPoseidonTx(2);
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.deployed();

    const PoseidonT6 = await deployPoseidonTx(5);
    const poseidonT6 = await PoseidonT6.deploy();
    await poseidonT6.deployed();

    const Semaphore = await ethers.getContractFactory("Semaphore", {
        libraries: {
            PoseidonT3: poseidonT3.address,
            PoseidonT6: poseidonT6.address,
        }
    });
    semaphore = await Semaphore.deploy(20, defaultExternalNullifier);
    await semaphore.deployed();
})

describe("Semaphore contract", () => {
  it("Default nullifier should be active", async () => {
    const isActive = await semaphore.isExternalNullifierActive(defaultExternalNullifier);
    expect(isActive).to.be.true;
  });
  it("ExternalNullifier should be active after add", async () => {
    await semaphore.addExternalNullifier(newExternalNullifier);
    const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier);
    expect(isActive).to.be.true;
  });
  it("ExternalNullifier should not be active after deactivation", async () => {
    await semaphore.deactivateExternalNullifier(newExternalNullifier);
    const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier);
    expect(isActive).to.be.false;
  });
  it("ExternalNullifier should be active after reactivation", async () => {
    await semaphore.reactivateExternalNullifier(newExternalNullifier);
    const isActive = await semaphore.isExternalNullifierActive(newExternalNullifier);
    expect(isActive).to.be.true;
  });
  it("Non owner should not be able to add nullifier", async () => {
    const [_, addr1] = await ethers.getSigners();
    
    const newNullifier = genExternalNullifier('voting-3');
    await expect(semaphore.connect(addr1).addExternalNullifier(newNullifier))
    .to.be.revertedWith('Ownable: caller is not the owner');
  })
  it("Non owner should be able to add nullifier after setPermissioning", async () => {
    const [_, addr1] = await ethers.getSigners();
    
    await semaphore.setPermissioning(true);
    const newNullifier = genExternalNullifier('voting-3');
    await semaphore.addExternalNullifier(newNullifier);
    const isActive = await semaphore.isExternalNullifierActive(newNullifier);
    expect(isActive).to.be.true;
  })
  it("Should fail to add already existing nullifier", async () => {    
    await expect(semaphore.addExternalNullifier(newExternalNullifier))
    .to.be.revertedWith('Semaphore: external nullifier already set');
  })
  it("Should return newExternalNullifier as next nullifier", async () => {
    const nextNullifier = await semaphore.getNextExternalNullifier(defaultExternalNullifier);
    expect(nextNullifier).to.be.equal(newExternalNullifier);
  });
});