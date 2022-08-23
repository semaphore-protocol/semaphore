/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */

pragma solidity ^0.8.5;

/**
    @title ChainIdWithType abstract contract
 */
 abstract contract ChainIdWithType {
    bytes2 public constant EVM_CHAIN_ID_TYPE = 0x0100;

    /**
        @notice Gets the chain id using the chain id opcode
     */
    function getChainId() public view returns (uint) {
        uint chainId;
        assembly { chainId := chainid() }
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
        Parses the typed chain ID out from a 32-byte resource ID
     */
    function parseChainIdFromResourceId(bytes32 _resourceId) public pure returns (uint64) {
        return uint64(uint48(bytes6(_resourceId << (26 * 8))));
    }
}
