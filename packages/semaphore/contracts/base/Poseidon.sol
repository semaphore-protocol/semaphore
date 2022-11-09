//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

library PoseidonT3Lib {
    function poseidon(uint256[2] memory input) public pure returns (uint256) {}
}

library PoseidonT6Lib {
    function poseidon(uint256[5] memory input) public pure returns (uint256) {}
}

interface IPoseidonT3 {
    function poseidon(uint256[2] memory input) external pure returns (uint256);
}

contract PoseidonT3 is IPoseidonT3 {
    function poseidon(
        uint256[2] memory
    ) external pure override returns (uint256) {
        return 0;
    }
}
