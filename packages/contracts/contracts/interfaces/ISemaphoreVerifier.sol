//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @title SemaphoreVerifier contract interface.
interface ISemaphoreVerifier {
    /// @dev Verifies whether a Semaphore proof is valid.
    /// @param _proof: ZK proof
    /// @param _publicInputs: [...inputs]
    function verify(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external view returns (bool);
}
