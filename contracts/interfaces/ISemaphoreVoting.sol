//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @title SemaphoreVoting interface.
/// @dev Interface of SemaphoreVoting contract.
interface ISemaphoreVoting {
  // The ballot structure.
  struct Ballot {
    address coordinator; // Coordinator of the ballot.
    uint256 startDate; // Voting start date (timestamp).
    uint256 endDate; // Voting end date (timestamp).
  }

  /// @dev Emitted when a new ballot is created.
  /// @param ballotId: Id of the ballot.
  /// @param coordinator: Coordinator of the ballot.
  /// @param startDate: Voting start date.
  /// @param endDate: Voting end date.
  event BallotCreated(uint256 ballotId, address coordinator, uint256 startDate, uint256 endDate);

  /// @dev Emitted when a user votes on a ballot.
  /// @param ballotId: Id of the ballot.
  /// @param vote: user vote (encrypted or not).
  event VoteAdded(uint256 indexed ballotId, bytes vote);

  /// @dev Emitted when a decryption key is published.
  /// @param ballotId: Id of the ballot.
  /// @param decryptionKey: Key to decrypt ballot votes.
  event DecryptionKeyPublished(uint256 indexed ballotId, uint256 decryptionKey);

  /// @dev Casts an anonymous vote in a ballot.
  /// @param vote: Encrypted or unencrypted vote.
  /// @param root: Merkle tree root.
  /// @param nullifierHash: Nullifier hash.
  /// @param ballotId: Id of the ballot.
  /// @param proof: Private zk-proof parameters.
  function castVote(
    bytes calldata vote,
    uint256 root,
    uint256 nullifierHash,
    uint256 ballotId,
    uint256[8] calldata proof
  ) external;

  /// @dev Adds a voter in a ballot.
  /// @param ballotId: Id of the ballot.
  /// @param identityCommitment: Identity commitment of the group member.
  function addVoter(uint256 ballotId, uint256 identityCommitment) external;

  /// @dev Creates a ballot and the associated Merkle tree/group.
  /// @param ballotId: Id of the ballot.
  /// @param coordinator: Coordinator of the ballot.
  /// @param startDate: Voting start date.
  /// @param endDate: Voting end date.
  function createBallot(
    uint256 ballotId,
    address coordinator,
    uint256 startDate,
    uint256 endDate
  ) external;

  /// @dev Publishes the key to decrypt the votes of a ballot.
  /// @param ballotId: Id of the ballot.
  /// @param decryptionKey: Key to decrypt ballot votes.
  function publishDecryptionKey(uint256 ballotId, uint256 decryptionKey) external;
}
