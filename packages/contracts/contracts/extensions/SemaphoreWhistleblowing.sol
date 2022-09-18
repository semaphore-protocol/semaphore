//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/ISemaphoreWhistleblowing.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore whistleblowing contract.
/// @dev The following code allows you to create entities for whistleblowers (e.g. non-profit
/// organization, newspaper) and to allow them to publish news leaks anonymously.
/// Leaks can be IPFS hashes, permanent links or other kinds of reference.
contract SemaphoreWhistleblowing is ISemaphoreWhistleblowing, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint256 => IVerifier) internal verifiers;

    /// @dev Gets an editor address and return their entity.
    mapping(address => uint256) private entities;

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

    /// @dev Checks if the editor is the transaction sender.
    /// @param entityId: Id of the entity.
    modifier onlyEditor(uint256 entityId) {
        if (entityId != entities[_msgSender()]) {
            revert Semaphore__CallerIsNotTheEditor();
        }

        _;
    }

    /// @dev See {ISemaphoreWhistleblowing-createEntity}.
    function createEntity(
        uint256 entityId,
        address editor,
        uint256 merkleTreeDepth
    ) public override {
        if (address(verifiers[merkleTreeDepth]) == address(0)) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }

        _createGroup(entityId, merkleTreeDepth, 0);

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
        bytes32 leak,
        uint256 nullifierHash,
        uint256 entityId,
        uint256[8] calldata proof
    ) public override onlyEditor(entityId) {
        uint256 merkleTreeDepth = getMerkleTreeDepth(entityId);
        uint256 merkleTreeRoot = getMerkleTreeRoot(entityId);

        IVerifier verifier = verifiers[merkleTreeDepth];

        _verifyProof(leak, merkleTreeRoot, nullifierHash, entityId, proof, verifier);

        emit LeakPublished(entityId, leak);
    }
}
