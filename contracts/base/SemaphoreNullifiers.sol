//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {SNARK_SCALAR_FIELD} from "./SemaphoreConstants.sol";
import "../interfaces/ISemaphoreNullifiers.sol";

/// @title Semaphore nullifiers contract.
/// @dev The following code allows you to add or remove external nullifier to be used in proofs.
/// External nullifiers help to prevent double-signaling by the same user.
abstract contract SemaphoreNullifiers is ISemaphoreNullifiers {
  /// @dev The external nullifier helps to prevent double-signaling by the same user.
  mapping(uint256 => bool) internal externalNullifiers;

  /// @dev Adds a new external nullifier.
  /// @param externalNullifier: External Semaphore nullifier.
  function _addExternalNullifier(uint256 externalNullifier) internal virtual {
    require(externalNullifiers[externalNullifier], "SemaphoreNullifiers: the external nullifier already exists");
    require(
      externalNullifier < SNARK_SCALAR_FIELD,
      "SemaphoreNullifiers: external nullifier must be < SNARK_SCALAR_FIELD"
    );

    externalNullifiers[externalNullifier] = true;

    emit ExternalNullifierAdded(externalNullifier);
  }

  /// @dev Removes an existing external nullifier.
  /// @param externalNullifier: External Semaphore nullifier.
  function _removeExternalNullifier(uint256 externalNullifier) internal virtual {
    require(!externalNullifiers[externalNullifier], "SemaphoreNullifiers: the external nullifier does not exists");
    require(
      externalNullifier < SNARK_SCALAR_FIELD,
      "SemaphoreNullifiers: external nullifier must be < SNARK_SCALAR_FIELD"
    );

    externalNullifiers[externalNullifier] = false;

    emit ExternalNullifierRemoved(externalNullifier);
  }
}
