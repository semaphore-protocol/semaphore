// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

/**
    @title SemaphoreInputEncoder library for encoding inputs for Semaphore Anchor proofs
*/
library SemaphoreInputEncoder {
    bytes2 public constant EVM_CHAIN_ID_TYPE = 0x0100;

    /**
        @notice Proof struct for Semaphore Anchor proofs
        @param proof The zkSNARK proof data
        @param roots The roots on the Semaphore Anchor bridge to verify the proof against
        @param nullifierHash The nullifier hash
        @param signalHash The hash of the signal
        @param externalNullifier The external nullifier
    */
    struct Proof {
        uint256[8] proof;
        uint256 nullifierHash;
        uint256 signalHash;
        uint256 externalNullifier;
        bytes roots;
    }

    /**
        @notice Gets the chain id using the chain id opcode
    */
    function getChainId() public view returns (uint256) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    /**
        @notice Computes the modified chain id using the underlying chain type (EVM)
    */
    function getChainIdType() public view returns (uint48) {
        // The chain ID and type pair is 6 bytes in length
        // The first 2 bytes are reserved for the chain type.
        // The last 4 bytes are reserved for a u32 (uint32) chain ID.
        bytes4 chainID = bytes4(uint32(getChainId()));
        bytes2 chainType = EVM_CHAIN_ID_TYPE;
        // We encode the chain ID and type pair into packed bytes which
        // should be 6 bytes using the encode packed method. We will
        // cast this as a bytes32 in order to encode as a uint256 for zkp verification.
        bytes memory chainIdWithType = abi.encodePacked(chainType, chainID);
        return uint48(bytes6(chainIdWithType));
    }

    /**
        @notice Encodes the proof into its public inputs and roots array for 2 input / 2 output txes
        @param _args The proof arguments
        @param _maxEdges The maximum # of edges supported by the underlying Semaphore Anchor
        @return (bytes, bytes) The public inputs and roots array separated
    */
    function _encodeInputs(Proof memory _args, uint8 _maxEdges)
        public
        view
        returns (bytes memory, bytes32[] memory)
    {
        uint256 _chainId = getChainIdType();
        bytes32[] memory result = new bytes32[](_maxEdges + 1);
        bytes memory encodedInput;

        if (_maxEdges == 1) {
            uint256[6] memory inputs;
            bytes32[2] memory roots = abi.decode(_args.roots, (bytes32[2]));
            // assign roots
            result[0] = roots[0];
            result[1] = roots[1];
            // assign input
            inputs[0] = _args.nullifierHash;
            inputs[1] = _args.signalHash;
            inputs[2] = _args.externalNullifier;
            inputs[3] = uint256(roots[0]);
            inputs[4] = uint256(roots[1]);
            inputs[5] = uint256(_chainId);
            encodedInput = abi.encodePacked(inputs);
        } else if (_maxEdges == 7) {
            uint256[12] memory inputs;
            bytes32[8] memory roots = abi.decode(_args.roots, (bytes32[8]));
            // assign roots
            result[0] = roots[0];
            result[1] = roots[1];
            result[2] = roots[2];
            result[3] = roots[3];
            result[4] = roots[4];
            result[5] = roots[5];
            result[6] = roots[6];
            result[7] = roots[7];
            // assign input
            inputs[0] = _args.nullifierHash;
            inputs[1] = _args.signalHash;
            inputs[2] = _args.externalNullifier;
            inputs[3] = uint256(roots[0]);
            inputs[4] = uint256(roots[1]);
            inputs[5] = uint256(roots[2]);
            inputs[6] = uint256(roots[3]);
            inputs[7] = uint256(roots[4]);
            inputs[8] = uint256(roots[5]);
            inputs[9] = uint256(roots[6]);
            inputs[10] = uint256(roots[7]);
            inputs[11] = uint256(_chainId);
            encodedInput = abi.encodePacked(inputs);
        } else {
            require(false, "Invalid edges");
        }

        return (encodedInput, result);
    }
}
