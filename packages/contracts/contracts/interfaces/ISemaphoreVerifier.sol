//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../base/Pairing.sol";

/// @title SemaphoreVerifier interface.
/// @dev Interface of SemaphoreVerifier contract.
interface ISemaphoreVerifier {
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }

    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }

    /// @dev Verifies that the zero-knowledge proof is valid.
    /// @param signal: Semaphore signal.
    /// @param root: Root of the Merkle tree.
    /// @param nullifierHash: Nullifier hash.
    /// @param externalNullifier: External nullifier.
    /// @param proof: Zero-knowledge proof.
    /// @param merkleTreeDepth: Depth of the tree.
    function verifyProof(
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint256 merkleTreeDepth
    ) external view;
}
