// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
    @dev The Edge struct is used to store the edge data for linkable tree connections.
    @param chainId The chain id where the LinkableTree contract being linked is located.
    @param root The latest merkle root of the LinkableTree contract being linked.
    @param nonce The latest leaf insertion index of the LinkableTree contract being linked.
    @param target The contract address or tree identifier of the LinkableTree being linked.
*/
struct Edge {
    uint256 chainID;
    uint256 root;
    uint256 latestLeafIndex;
    bytes32 srcResourceID;
}
