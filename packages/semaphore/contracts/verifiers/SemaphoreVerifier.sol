/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */

pragma solidity ^0.8.0;

import "../interfaces/ISemaphoreVerifier.sol";
import "../interfaces/IVerifier.sol";

contract SemaphoreVerifier {
    ISemaphoreVerifier2_2 public v2_2;
    // ISemaphoreVerifier2_16 public v2_16;

    ISemaphoreVerifier8_2 public v8_2;

    // ISemaphoreVerifier8_16 public v8_16;

    constructor(
        address _verifier2_2,
        // ISemaphoreVerifier2_16 _verifier_2_16,
        address _verifier8_2 // ISemaphoreVerifier8_16 _verifier_8_16
    ) {
        v2_2 = ISemaphoreVerifier2_2(_verifier2_2);
        v8_2 = ISemaphoreVerifier8_2(_verifier8_2);
    }

    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        bytes memory input,
        uint8 maxEdges
    ) external view returns (bool r) {
        if (maxEdges == 1) {
            uint256[6] memory _inputs = abi.decode(input, (uint256[6]));
            r = v2_2.verifyProof(a, b, c, _inputs);
            // TODO: Fix the rest of the function with correct number of arguments to verifiers.
            return r;
        } else if (maxEdges == 7) {
            uint256[12] memory _inputs = abi.decode(input, (uint256[12]));
            return v8_2.verifyProof(a, b, c, _inputs);
        } else {
            return false;
        }
    }
    // function verifyProof(
    // 	uint[2] memory a,
    // 	uint[2][2] memory b,
    // 	uint[2] memory c,
    // 	bytes memory input,
    // 	uint8 maxEdges,
    // 	bool smallInputs
    // ) override external view returns (bool r) {
    // 	if (maxEdges == 1) {
    // 		if (smallInputs) {
    // 			uint256[7] memory _inputs = abi.decode(input, (uint256[7]));
    // 			return v2_2.verifyProof(a, b, c, _inputs);
    // 		} else {
    //                // TODO: Fix the rest of the function with correct number of arguments to verifiers.
    // 			uint256[23] memory _inputs = abi.decode(input, (uint256[23]));
    // 			return v2_16.verifyProof(a, b, c, _inputs);
    // 		}
    //            // TODO: Fix the rest of the function with correct number of arguments to verifiers.
    // 	} else if (maxEdges == 7) {
    // 		if (smallInputs) {
    // 			uint256[15] memory _inputs = abi.decode(input, (uint256[15]));
    // 			return v8_2.verifyProof(a, b, c, _inputs);
    // 		} else {
    //                // TODO: Fix the rest of the function with correct number of arguments to verifiers.
    // 			uint256[29] memory _inputs = abi.decode(input, (uint256[29]));
    // 			return v8_16.verifyProof(a, b, c, _inputs);
    // 		}
    // 	} else {
    // 		return false;
    // 	}
    // }
}
