//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./SemaphoreCore.sol";
import "./SemaphoreGroups.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SemaphoreVoting is SemaphoreCore, SemaphoreGroups {
  /// @dev Emitted when a ballot is created.
  /// @param ballotId: ...
  /// @param coordinator: ...
  /// @param startDate: ...
  /// @param endDate: ...
  event BallotCreated(uint256 ballotId, address coordinator, uint256 startDate, uint256 endDate);

  /// @dev Emitted when a user votes on a ballot.
  /// @param ballotId: ...
  /// @param vote: user vote (encrypted or not).
  event VoteAdded(uint256 indexed ballotId, bytes vote);

  /// @dev Emitted when a decryption key is published.
  /// @param ballotId: ...
  /// @param decryptionKey: decryption key.
  event DecryptionKeyPublished(uint256 indexed ballotId, uint256 decryptionKey);

  // The ballot structure.
  struct Ballot {
    address coordinator; // Coordinator of the ballot.
    uint256 startDate; // Ballot start timestamp.
    uint256 endDate; // Ballot end timestamp.
  }

  /// @dev Gets a ballot id and returns the ballot data.
  mapping(uint256 => Ballot) private ballots;

  modifier onlyCoordinator(uint256 ballotId) {
    require(ballots[ballotId].coordinator == _msgSender(), "SemaphoreVoting: caller is not the ballot coordinator");
    _;
  }

  /// @dev Creates ...
  /// @param ballotId: Id of the ballot.
  function createBallot(
    uint256 ballotId,
    address coordinator,
    uint256 startDate,
    uint256 endDate
  ) external {
    _createGroup(ballotId, 20, 0);

    Ballot memory ballot;

    ballot.coordinator = coordinator;
    ballot.startDate = startDate;
    ballot.endDate = endDate;

    ballots[ballotId] = ballot;

    emit BallotCreated(ballotId, coordinator, startDate, endDate);
  }

  /// @dev Creates ...
  /// @param ballotId: Id of the ballot.
  function addVoter(uint256 ballotId, uint256 identityCommitment) external onlyCoordinator(ballotId) {
    require(
      block.timestamp < ballots[ballotId].startDate,
      "SemaphoreVoting: voters can be added before the start date"
    );

    _addIdentityCommitment(ballotId, identityCommitment);
  }

  function castVote(
    bytes memory vote,
    uint256 root,
    uint256 nullifierHash,
    uint256 ballotId,
    uint256[8] calldata proof
  ) public onlyCoordinator(ballotId) {
    Ballot memory ballot = ballots[ballotId];

    require(block.timestamp > ballot.startDate, "SemaphoreVoting: Invalid vote in advance");
    require(block.timestamp < ballot.endDate, "SemaphoreVoting: Invalid late vote");

    require(ballotId == rootHistory[root], "SemaphoreVoting: the root does not match any ballot");
    require(_isValidProof(vote, root, nullifierHash, ballotId, proof), "SemaphoreVoting: the proof is not valid");

    // Prevent double-signaling (nullifierHash = hash(ballotId + identityNullifier)).
    _saveNullifierHash(nullifierHash);

    emit VoteAdded(ballotId, vote);
  }

  /// @dev Publishes the key to decrypt the votes of a ballot.
  /// @param ballotId: ballot id.
  /// @param decryptionKey: ballot decryption key.
  function publishDecryptionKey(uint256 ballotId, uint256 decryptionKey) external onlyCoordinator(ballotId) {
    require(block.timestamp > ballots[ballotId].endDate, "decryption key can be published after the end date");

    emit DecryptionKeyPublished(ballotId, decryptionKey);
  }
}
