//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/ISemaphoreVoting.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore voting contract.
/// @dev The following code allows you to create polls, add voters and allow them to vote anonymously.
contract SemaphoreVoting is ISemaphoreVoting, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint8 => IVerifier) internal verifiers;

    /// @dev Gets a poll id and returns the poll data.
    mapping(uint256 => Poll) internal polls;

    /// @dev Since there can be multiple verifier contracts (each associated with a certain tree depth),
    /// it is necessary to pass the addresses of the previously deployed contracts with the associated
    /// tree depth. Depending on the depth chosen when creating the poll, a certain verifier will be
    /// used to verify that the proof is correct.
    /// @param depths: Three depths used in verifiers.
    /// @param verifierAddresses: Verifier addresses.
    constructor(uint8[] memory depths, address[] memory verifierAddresses) {
        require(
            depths.length == verifierAddresses.length,
            "SemaphoreVoting: parameters lists does not have the same length"
        );

        for (uint8 i = 0; i < depths.length; i++) {
            verifiers[depths[i]] = IVerifier(verifierAddresses[i]);
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
        uint8 depth,
        uint8 maxEdges
    ) public override {
        require(address(verifiers[depth]) != address(0), "SemaphoreVoting: depth value is not supported");

        _createGroup(pollId, depth, 0, maxEdges);

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
        bytes calldata roots,
        uint256[8] calldata proof
    ) public override onlyCoordinator(pollId) {
        Poll memory poll = polls[pollId];

        require(poll.state == PollState.Ongoing, "SemaphoreVoting: vote can only be cast in an ongoing poll");

        uint8 depth = getDepth(pollId);
        uint8 maxEdges = getMaxEdges(pollId);
        IVerifier verifier = verifiers[depth];

        _verifyProof(vote, nullifierHash, pollId, roots, proof, verifier, maxEdges);

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
