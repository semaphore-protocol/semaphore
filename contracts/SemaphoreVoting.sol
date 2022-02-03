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

  modifier onlyCoordinator(uint256 _ballotId) {
    require(ballots[_ballotId].coordinator == _msgSender(), "SemaphoreVoting: caller is not the ballot coordinator");
    _;
  }

  /// @dev Creates ...
  /// @param _ballotId: Id of the ballot.
  function createBallot(
    uint256 _ballotId,
    address _coordinator,
    uint256 _startDate,
    uint256 _endDate
  ) external {
    _createGroup(_ballotId, 20, 0);

    Ballot memory ballot;

    ballot.coordinator = _coordinator;
    ballot.startDate = _startDate;
    ballot.endDate = _endDate;

    ballots[_ballotId] = ballot;

    emit BallotCreated(_ballotId, _coordinator, _startDate, _endDate);
  }

  /// @dev Creates ...
  /// @param _ballotId: Id of the ballot.
  function addVoter(uint256 _ballotId, uint256 _identityCommitment) external onlyCoordinator(_ballotId) {
    require(
      block.timestamp < ballots[_ballotId].startDate,
      "SemaphoreVoting: voters can be added before the start date"
    );

    _addIdentityCommitment(_ballotId, _identityCommitment);
  }

  function vote(
    bytes memory _vote,
    uint256 _root,
    uint256 _nullifierHash,
    uint256 _ballotId,
    uint256[8] calldata _proof
  ) public onlyCoordinator(_ballotId) {
    Ballot memory ballot = ballots[_ballotId];

    require(block.timestamp > ballot.startDate, "SemaphoreVoting: Invalid vote in advance");
    require(block.timestamp < ballot.endDate, "SemaphoreVoting: Invalid late vote");

    require(_ballotId == rootHistory[_root], "SemaphoreVoting: the root does not match any ballot");
    require(_isValidProof(_vote, _root, _nullifierHash, _ballotId, _proof), "SemaphoreVoting: the proof is not valid");

    // Prevent double-signaling (nullifierHash = hash(ballotId + identityNullifier)).
    _saveNullifierHash(_nullifierHash);

    emit VoteAdded(_ballotId, _vote);
  }

  /// @dev Publishes the key to decrypt the votes of a ballot.
  /// @param _ballotId: ballot id.
  /// @param _decryptionKey: ballot decryption key.
  function publishDecryptionKey(uint256 _ballotId, uint256 _decryptionKey) external onlyCoordinator(_ballotId) {
    require(block.timestamp > ballots[_ballotId].endDate, "decryption key can be published after the end date");

    emit DecryptionKeyPublished(_ballotId, _decryptionKey);
  }
}
