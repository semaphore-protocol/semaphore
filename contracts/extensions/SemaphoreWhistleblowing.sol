//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/ISemaphoreWhistleblowing.sol";
import "../base/SemaphoreCore.sol";
import "../base/SemaphoreGroups.sol";

/// @title Semaphore whistleblowing contract.
/// @dev The following code allows you to create entities for whistleblowers (e.g. non-profit
/// organization, newspaper) and to allow them to publish news leaks anonymously.
/// Leaks can be IPFS hashes, permanent links or other kinds of reference.
contract SemaphoreWhistleblowing is ISemaphoreWhistleblowing, SemaphoreCore, SemaphoreGroups {
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint8 => SemaphoreVerifier) internal verifiers;

    /// @dev Gets an editor address and return their entity.
    mapping(address => uint256) private entities;

    /// @dev Since there can be multiple verifier contracts (each associated with a certain tree depth),
    /// it is necessary to pass the addresses of the previously deployed contracts with the associated
    /// tree depth. Depending on the depth chosen when creating the entity, a certain verifier will be
    /// used to verify that the proof is correct.
    /// @param depths: Three depths used in verifiers.
    /// @param verifierAddresses: Verifier addresses.
    constructor(uint8[] memory depths, address[] memory verifierAddresses) {
        require(
            depths.length == verifierAddresses.length,
            "SemaphoreWhistleblowing: parameters lists does not have the same length"
        );

        for (uint8 i = 0; i < depths.length; i++) {
            verifiers[depths[i]] = SemaphoreVerifier(verifierAddresses[i]);
        }
    }

    /// @dev Checks if the editor is the transaction sender.
    /// @param entityId: Id of the entity.
    modifier onlyEditor(uint256 entityId) {
        require(entityId == entities[_msgSender()], "SemaphoreWhistleblowing: caller is not the editor");
        _;
    }

    /// @dev See {ISemaphoreWhistleblowing-createEntity}.
    function createEntity(
        uint256 entityId,
        uint8 depth,
        uint256 zeroValue,
        address editor,
        uint8 maxEdges
    ) public override {
        require(address(verifiers[depth]) != address(0), "SemaphoreWhistleblowing: depth value is not supported");

        _createGroup(entityId, depth, zeroValue, maxEdges);

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
        bytes calldata roots,
        uint256[8] calldata proof,
        uint8 maxEdges,
        uint root
    ) public override onlyEditor(entityId) {
        uint root = getRoot(entityId);
        uint8 depth = getDepth(entityId);
        uint8 maxEdges = getMaxEdges(entityId);
        SemaphoreVerifier verifier = verifiers[depth];

        _verifyProof(leak, nullifierHash, entityId, roots, proof, verifier, maxEdges, root);

        emit LeakPublished(entityId, leak);
    }
}
