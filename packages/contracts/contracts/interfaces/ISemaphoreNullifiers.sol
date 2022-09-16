//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @title SemaphoreNullifiers interface.
/// @dev Interface of SemaphoreNullifiers contract.
interface ISemaphoreNullifiers {
    /// @dev Emitted when a external nullifier is added.
    /// @param externalNullifier: External Semaphore nullifier.
    event ExternalNullifierAdded(uint256 externalNullifier);

    /// @dev Emitted when a external nullifier is removed.
    /// @param externalNullifier: External Semaphore nullifier.
    event ExternalNullifierRemoved(uint256 externalNullifier);
}
