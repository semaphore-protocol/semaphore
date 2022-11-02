//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/ISemaphoreVoting.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore voting contract.
/// @dev The following code allows you to create polls, add voters and allow them to vote anonymously.
contract SemaphoreVoting is ISemaphoreVoting, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint256 => SemaphoreVerifier) internal verifiers;

    /// @dev Gets a poll id and returns the poll data.
    mapping(uint256 => Poll) internal polls;

    /// @dev Gets a nullifier hash and returns true or false.
    /// It is used to prevent double-voting.
    mapping(uint256 => bool) internal nullifierHashes;

    /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
    /// @param _verifiers: List of Semaphore verifiers (address and related Merkle tree depth).
    constructor(Verifier[] memory _verifiers) {
        for (uint8 i = 0; i < _verifiers.length; ) {
            verifiers[_verifiers[i].merkleTreeDepth] = SemaphoreVerifier(
                _verifiers[i].contractAddress
            );

            unchecked {
                ++i;
            }
        }
    }

    /// @dev Checks if the poll coordinator is the transaction sender.
    /// @param pollId: Id of the poll.
    modifier onlyCoordinator(uint256 pollId) {
        if (polls[pollId].coordinator != _msgSender()) {
            revert Semaphore__CallerIsNotThePollCoordinator();
        }
        _;
    }

    /// @dev See {ISemaphoreVoting-createPoll}.
    function createPoll(
        uint256 pollId,
        uint256 merkleTreeDepth,
        address coordinator,
        uint8 maxEdges
    ) public override {
        if (address(verifiers[merkleTreeDepth]) == address(0)) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }

        _createGroup(pollId, merkleTreeDepth, maxEdges);

        Poll memory poll;

        poll.coordinator = coordinator;
        poll.maxEdges = maxEdges;

        polls[pollId] = poll;

        emit PollCreated(pollId, coordinator);
    }

    /// @dev See {ISemaphoreVoting-updateEdge}.
    function updateEdge(
        uint256 pollId,
        uint256 root,
        uint32 leafIndex,
        bytes32 typedChainId
    ) external override onlyCoordinator(pollId) {
        _updateEdge(pollId, root, leafIndex, typedChainId);
    }

    /// @dev See {ISemaphoreVoting-addVoter}.
    function addVoter(uint256 pollId, uint256 identityCommitment)
        public
        override
        onlyCoordinator(pollId)
    {
        if (polls[pollId].state != PollState.Created) {
            revert Semaphore__PollHasAlreadyBeenStarted();
        }
        _addMember(pollId, identityCommitment);
    }

    /// @dev See {ISemaphoreVoting-addVoter}.
    function startPoll(uint256 pollId, uint256 encryptionKey)
        public
        override
        onlyCoordinator(pollId)
    {
        if (polls[pollId].state != PollState.Created) {
            revert Semaphore__PollHasAlreadyBeenStarted();
        }
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
        uint8 maxEdges = getMaxEdges(pollId);
        // TODO: Can we improve this? getting stack too deep error
        Poll memory poll = polls[pollId];

        if (poll.state != PollState.Ongoing) {
            revert Semaphore__PollIsNotOngoing();
        }

        if (nullifierHashes[nullifierHash]) {
            revert Semaphore__YouAreUsingTheSameNillifierTwice();
        }

        uint256 merkleTreeDepth = getMerkleTreeDepth(pollId);
        // uint256 merkleTreeRoot = getMerkleTreeRoot(pollId);

        verifyRoots(pollId, roots);

        SemaphoreVerifier verifier = verifiers[merkleTreeDepth];

        _verifyProof(
            vote,
            nullifierHash,
            pollId,
            roots,
            proof,
            verifier,
            maxEdges
        );

        nullifierHashes[nullifierHash] = true;

        emit VoteAdded(pollId, vote);
    }

    /// @dev See {ISemaphoreVoting-publishDecryptionKey}.
    function endPoll(uint256 pollId, uint256 decryptionKey)
        public
        override
        onlyCoordinator(pollId)
    {
        if (polls[pollId].state != PollState.Ongoing) {
            revert Semaphore__PollIsNotOngoing();
        }
        polls[pollId].state = PollState.Ended;

        emit PollEnded(pollId, _msgSender(), decryptionKey);
    }
}
