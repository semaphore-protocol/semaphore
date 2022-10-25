//SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

/// @title Verifier interface.
/// @dev Interface of Verifier contract.
interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        bytes memory input,
        uint8 maxEdges
    ) external view returns (bool r);
}
