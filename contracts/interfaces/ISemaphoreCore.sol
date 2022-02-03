//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @title SemaphoreCore interface.
/// @dev Interface of a SemaphoreCore contract.
interface ISemaphoreCore {
  /// @notice Emitted when a proof is verified correctly and a new nullifier hash is added.
  /// @param nullifierHash: Hash of external and identity nullifiers.
  event NullifierHashAdded(uint256 nullifierHash);
}
