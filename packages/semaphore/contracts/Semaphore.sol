// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/ISemaphore.sol";
import "./verifiers/SemaphoreVerifier.sol";
import "./base/SemaphoreCore.sol";
import "./base/SemaphoreGroups.sol";
import {PoseidonT3Lib as PoseidonT3} from "./base/Poseidon.sol";

/// @title Semaphore
contract Semaphore is ISemaphore, SemaphoreCore, SemaphoreGroups {
    bytes2 public constant EVM_CHAIN_ID_TYPE = 0x0100;
    /// @dev Gets a tree depth and returns its verifier address.
    mapping(uint256 => SemaphoreVerifier) public verifiers;

    /// @dev Gets a group id and returns the group parameters.
    mapping(uint256 => Group) public groups;

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        if (groups[groupId].admin != _msgSender()) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
        _;
    }

    /// @dev Checks if there is a verifier for the given tree depth.
    /// @param merkleTreeDepth: Depth of the tree.
    modifier onlySupportedMerkleTreeDepth(uint256 merkleTreeDepth) {
        if (address(verifiers[merkleTreeDepth]) == address(0)) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }
        _;
    }

    /// @dev Initializes the Semaphore verifiers used to verify the user's ZK proofs.
    /// @param _verifierAddresses: List of Semaphore verifier addresses
    /// @param _merkleTreeDepths: List of related Merkle tree depths).
    // constructor(Verifier[] memory _verifiers) {
    constructor(address[] memory _verifierAddresses, uint256[] memory _merkleTreeDepths) {
        for (uint8 i = 0; i < _verifierAddresses.length; ) {
            verifiers[_merkleTreeDepths[i]] = SemaphoreVerifier(_verifierAddresses[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        address admin,
        uint8 maxEdges
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth, maxEdges);

        groups[groupId].admin = admin;
        groups[groupId].merkleRootDuration = 1 hours;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        address admin,
        uint8 maxEdges,
        uint256 merkleTreeRootDuration
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth, maxEdges);

        groups[groupId].admin = admin;
        groups[groupId].merkleRootDuration = merkleTreeRootDuration;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-updateGroupAdmin}.
    function updateGroupAdmin(
        uint256 groupId,
        address newAdmin
    ) external override onlyGroupAdmin(groupId) {
        groups[groupId].admin = newAdmin;
        emit GroupAdminUpdated(groupId, _msgSender(), newAdmin);
    }

    /**
        @notice Gets the chain id using the chain id opcode
    */
    function getChainId() public view returns (uint256) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    function getChainIdType() public view returns (uint48) {
        // The chain ID and type pair is 6 bytes in length
        // The first 2 bytes are reserved for the chain type.
        // The last 4 bytes are reserved for a u32 (uint32) chain ID.
        bytes4 chainID = bytes4(uint32(getChainId()));
        bytes2 chainType = EVM_CHAIN_ID_TYPE;
        // We encode the chain ID and type pair into packed bytes which
        // should be 6 bytes using the encode packed method. We will
        // cast this as a bytes32 in order to encode as a uint256 for zkp verification.
        bytes memory chainIdWithType = abi.encodePacked(chainType, chainID);
        return uint48(bytes6(chainIdWithType));
    }

    /**
        @notice Add an edge to the tree or update an existing edge.
        @param groupId The groupID of the LinkableTree
        @param root The merkle root of the edge's merkle tree
        @param leafIndex The latest leaf insertion index of the edge's merkle tree
        @param typedChainId The origin resource ID of the originating linked anchor update
     */
    function updateEdge(
        uint256 groupId,
        uint256 root,
        uint32 leafIndex,
        bytes32 typedChainId
    ) external override onlyGroupAdmin(groupId) {
        _updateEdge(groupId, root, leafIndex, typedChainId);
    }

    /// @dev See {ISemaphore-addMember}.
    function addMember(
        uint256 groupId,
        uint256 identityCommitment
    ) external override onlyGroupAdmin(groupId) {
        _addMember(groupId, identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block
            .timestamp;
    }

    /// @dev See {ISemaphore-addMembers}.
    function addMembers(
        uint256 groupId,
        uint256[] calldata identityCommitments
    ) external override onlyGroupAdmin(groupId) {
        for (uint8 i = 0; i < identityCommitments.length; ) {
            _addMember(groupId, identityCommitments[i]);

            unchecked {
                ++i;
            }
        }

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block
            .timestamp;
    }

    /// @dev See {ISemaphore-updateMember}.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _updateMember(
            groupId,
            identityCommitment,
            newIdentityCommitment,
            proofSiblings,
            proofPathIndices
        );
    }

    /// @dev See {ISemaphore-removeMember}.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _removeMember(
            groupId,
            identityCommitment,
            proofSiblings,
            proofPathIndices
        );
    }

    // Function exposed for testing purposes
    function decodeRoots(
        bytes calldata roots
    ) external pure override returns (bytes32[] memory rootsDecoded) {
        rootsDecoded = abi.decode(roots, (bytes32[]));
        return rootsDecoded;
    }

    /// @dev See {ISemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        bytes32 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        // TODO: Create standard encoding for which order each root is supposed to be at.
        bytes calldata roots,
        uint256[8] calldata proof
    ) external override {
        uint256 depth = getMerkleTreeDepth(groupId);
        uint8 maxEdges = getMaxEdges(groupId);
        uint256 currentMerkleTreeRoot = getMerkleTreeRoot(groupId);

        if (currentMerkleTreeRoot == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        if (!verifyRoots(groupId, roots)) {
            uint256 merkleRootCreationDate = groups[groupId]
                .merkleRootCreationDates[currentMerkleTreeRoot];
            uint256 merkleRootDuration = groups[groupId].merkleRootDuration;

            if (merkleRootCreationDate == 0) {
                revert Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }
            if (block.timestamp > merkleRootCreationDate + merkleRootDuration) {
                revert Semaphore__MerkleTreeRootIsExpired();
            }
        }

        if (groups[groupId].nullifierHashes[nullifierHash]) {
            revert Semaphore__YouAreUsingTheSameNillifierTwice();
        }

        SemaphoreVerifier verifier = verifiers[depth];

        _verifyProof(
            signal,
            nullifierHash,
            externalNullifier,
            roots,
            proof,
            verifier,
            maxEdges
        );

        groups[groupId].nullifierHashes[nullifierHash] = true;

        emit ProofVerified(
            groupId,
            currentMerkleTreeRoot,
            nullifierHash,
            externalNullifier,
            signal
        );
    }
}
