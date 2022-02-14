//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "../interfaces/ISemaphoreWhistleblowing.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore whistleblowing contract.
/// @dev The following code allows you to create entities for whistleblowers (e.g. non-profit
/// organization, newspaper) and to allow them to publish news leaks anonymously.
/// Leaks can be IPFS hashes, permanent links or other kinds of reference.
contract SemaphoreWhistleblowing is ISemaphoreWhistleblowing, SemaphoreCore, SemaphoreGroups {
  /// @dev Gets an editor address and return their entity.
  mapping(address => uint256) private entities;

  /// @dev Checks if the editor is the transaction sender.
  /// @param entityId: Id of the entity.
  modifier onlyEditor(uint256 entityId) {
    require(entityId == entities[_msgSender()], "SemaphoreWhistleblowing: caller is not the editor");
    _;
  }

  /// @dev See {ISemaphoreWhistleblowing-createEntity}.
  function createEntity(uint256 entityId, address editor) public override {
    _createGroup(entityId, 20);

    entities[editor] = entityId;

    emit EntityCreated(entityId, editor);
  }

  /// @dev See {ISemaphoreWhistleblowing-addWhistleblower}.
  function addWhistleblower(uint256 entityId, uint256 identityCommitment) public override onlyEditor(entityId) {
    _addMember(entityId, identityCommitment);
  }

  /// @dev See {ISemaphoreWhistleblowing-removeWhistleblower}.
  function removeWhistleblower(
    uint256 entityId,
    uint256 identityCommitment,
    uint256[] calldata proofSiblings,
    uint8[] calldata proofPathIndices
  ) public override onlyEditor(entityId) {
    _removeMember(entityId, identityCommitment, proofSiblings, proofPathIndices);
  }

  /// @dev See {ISemaphoreWhistleblowing-publishLeak}.
  function publishLeak(
    string calldata leak,
    uint256 nullifierHash,
    uint256 entityId,
    uint256[8] calldata proof
  ) public override onlyEditor(entityId) {
    require(
      _isValidProof(leak, groups[entityId].root, nullifierHash, entityId, proof),
      "SemaphoreWhistleblowing: the proof is not valid"
    );

    emit LeakPublished(entityId, leak);
  }
}
