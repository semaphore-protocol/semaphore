//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

// This value should be equal to 0x7d10c03d1f7884c85edee6353bd2b2ffbae9221236edde3778eac58089912bc0,
// which you can calculate using the following ethers.js code:
// ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')])
uint256 constant TREE_ZERO_VALUE = uint256(keccak256(abi.encodePacked("Semaphore"))) % SNARK_SCALAR_FIELD;
