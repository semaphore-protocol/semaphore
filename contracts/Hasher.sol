//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {PoseidonT3, PoseidonT6} from "./Poseidon.sol";
import {SnarkConstants} from "./SnarkConstants.sol";

/*
 * Poseidon hash functions for 2, 5, and 11 input elements.
 */
contract Hasher is SnarkConstants {
  function hash5(uint256[5] memory array) public pure returns (uint256) {
    return PoseidonT6.poseidon(array);
  }

  function hash11(uint256[] memory array) public pure returns (uint256) {
    uint256[] memory input11 = new uint256[](11);
    uint256[5] memory first5;
    uint256[5] memory second5;
    for (uint256 i = 0; i < array.length; i++) {
      input11[i] = array[i];
    }

    for (uint256 i = array.length; i < 11; i++) {
      input11[i] = 0;
    }

    for (uint256 i = 0; i < 5; i++) {
      first5[i] = input11[i];
      second5[i] = input11[i + 5];
    }

    uint256[2] memory first2;
    first2[0] = PoseidonT6.poseidon(first5);
    first2[1] = PoseidonT6.poseidon(second5);
    uint256[2] memory second2;
    second2[0] = PoseidonT3.poseidon(first2);
    second2[1] = input11[10];
    return PoseidonT3.poseidon(second2);
  }

  function hashLeftRight(uint256 _left, uint256 _right) public pure returns (uint256) {
    uint256[2] memory input;
    input[0] = _left;
    input[1] = _right;
    return PoseidonT3.poseidon(input);
  }
}
