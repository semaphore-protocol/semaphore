//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./interfaces/ISemaphoreVoting.sol";
import "./SemaphoreCore.sol";
import "./SemaphoreGroups.sol";

/// @title Semaphore voting contract.
/// @dev The following code allows you to create ballots, add voters and allow them to vote anonymously.
contract SemaphoreVoting is ISemaphoreVoting, SemaphoreCore, SemaphoreGroups {
  /// @dev Gets a ballot id and returns the ballot data.
  mapping(uint256 => Ballot) private ballots;

  /// @dev Checks if the ballot coordinator is the transaction sender.
  /// @param ballotId: Id of the ballot.
  modifier onlyCoordinator(uint256 ballotId) {
    require(ballots[ballotId].coordinator == _msgSender(), "SemaphoreVoting: caller is not the ballot coordinator");
    _;
  }

  /// @dev See {ISemaphoreVoting-createBallot}.
  function createBallot(
    uint256 ballotId,
    address coordinator,
    uint256 startDate,
    uint256 endDate
  ) public override {
    _createGroup(ballotId, 20);

    Ballot memory ballot;

    ballot.coordinator = coordinator;
    ballot.startDate = startDate;
    ballot.endDate = endDate;

    ballots[ballotId] = ballot;

    emit BallotCreated(ballotId, coordinator, startDate, endDate);
  }

  /// @dev See {ISemaphoreVoting-addVoter}.
  function addVoter(uint256 ballotId, uint256 identityCommitment) public override onlyCoordinator(ballotId) {
    require(
      block.timestamp < ballots[ballotId].startDate,
      "SemaphoreVoting: voters can be added before the start date"
    );

    _addMember(ballotId, identityCommitment);
  }

  /// @dev See {ISemaphoreVoting-castVote}.
  function castVote(
    bytes calldata vote,
    uint256 root,
    uint256 nullifierHash,
    uint256 ballotId,
    uint256[8] calldata proof
  ) public override onlyCoordinator(ballotId) {
    Ballot memory ballot = ballots[ballotId];

    require(block.timestamp > ballot.startDate, "SemaphoreVoting: Invalid vote in advance");
    require(block.timestamp < ballot.endDate, "SemaphoreVoting: Invalid late vote");

    require(ballotId == rootHistory[root], "SemaphoreVoting: the root does not match any ballot");
    require(_isValidProof(vote, root, nullifierHash, ballotId, proof), "SemaphoreVoting: the proof is not valid");

    // Prevent double-voting (nullifierHash = hash(ballotId + identityNullifier)).
    _saveNullifierHash(nullifierHash);

    emit VoteAdded(ballotId, vote);
  }

  /// @dev See {ISemaphoreVoting-publishDecryptionKey}.
  function publishDecryptionKey(uint256 ballotId, uint256 decryptionKey) public override onlyCoordinator(ballotId) {
    require(
      block.timestamp > ballots[ballotId].endDate,
      "SemaphoreVoting: decryption key can be published after the end date"
    );

    emit DecryptionKeyPublished(ballotId, decryptionKey);
  }
}
