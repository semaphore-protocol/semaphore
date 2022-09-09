//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/ISemaphoreVoting.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore voting contract.
/// @dev The following code allows you to create polls, add voters and allow them to vote anonymously.
contract SemaphoreVoting is ISemaphoreVoting, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint256 => IVerifier) internal verifiers;

    /// @dev Gets a poll id and returns the poll data.
    mapping(uint256 => Poll) internal polls;

    /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
    /// @param _verifiers: List of Semaphore verifiers (address and related Merkle tree depth).
    constructor(Verifier[] memory _verifiers) {
        for (uint8 i = 0; i < _verifiers.length; ) {
            verifiers[_verifiers[i].merkleTreeDepth] = IVerifier(_verifiers[i].contractAddress);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev Checks if the poll coordinator is the transaction sender.
    /// @param pollId: Id of the poll.
    modifier onlyCoordinator(uint256 pollId) {
        require(polls[pollId].coordinator == _msgSender(), "SemaphoreVoting: caller is not the poll coordinator");
        _;
    }

    /// @dev See {ISemaphoreVoting-createPoll}.
    function createPoll(
        uint256 pollId,
        address coordinator,
        uint256 merkleTreeDepth
    ) public override {
        require(
            address(verifiers[merkleTreeDepth]) != address(0),
            "SemaphoreVoting: Merkle tree depth value is not supported"
        );

        _createGroup(pollId, merkleTreeDepth, 0);

        Poll memory poll;

        poll.coordinator = coordinator;

        polls[pollId] = poll;

        emit PollCreated(pollId, coordinator);
    }

    /// @dev See {ISemaphoreVoting-addVoter}.
    function addVoter(uint256 pollId, uint256 identityCommitment) public override onlyCoordinator(pollId) {
        require(polls[pollId].state == PollState.Created, "SemaphoreVoting: voters can only be added before voting");

        _addMember(pollId, identityCommitment);
    }

    /// @dev See {ISemaphoreVoting-addVoter}.
    function startPoll(uint256 pollId, uint256 encryptionKey) public override onlyCoordinator(pollId) {
        require(polls[pollId].state == PollState.Created, "SemaphoreVoting: poll has already been started");

        polls[pollId].state = PollState.Ongoing;

        emit PollStarted(pollId, _msgSender(), encryptionKey);
    }

    /// @dev See {ISemaphoreVoting-castVote}.
    function castVote(
        bytes32 vote,
        uint256 nullifierHash,
        uint256 pollId,
        uint256[8] calldata proof
    ) public override onlyCoordinator(pollId) {
        Poll memory poll = polls[pollId];

        require(poll.state == PollState.Ongoing, "SemaphoreVoting: vote can only be cast in an ongoing poll");

        uint256 merkleTreeDepth = getMerkleTreeDepth(pollId);
        uint256 merkleTreeRoot = getMerkleTreeRoot(pollId);

        IVerifier verifier = verifiers[merkleTreeDepth];

        _verifyProof(vote, merkleTreeRoot, nullifierHash, pollId, proof, verifier);

        // Prevent double-voting (nullifierHash = hash(pollId + identityNullifier)).
        _saveNullifierHash(nullifierHash);

        emit VoteAdded(pollId, vote);
    }

    /// @dev See {ISemaphoreVoting-publishDecryptionKey}.
    function endPoll(uint256 pollId, uint256 decryptionKey) public override onlyCoordinator(pollId) {
        require(polls[pollId].state == PollState.Ongoing, "SemaphoreVoting: poll is not ongoing");

        polls[pollId].state = PollState.Ended;

        emit PollEnded(pollId, _msgSender(), decryptionKey);
    }
}
