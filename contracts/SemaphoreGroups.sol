//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {Semaphore} from "./Semaphore.sol";
import "@zk-kit/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SemaphoreGroups is Semaphore, Ownable {
  using IncrementalBinaryTree for IncrementalTreeData;

  /// @dev Emitted when a new group is created.
  /// @param id: Id of the group.
  /// @param depth: Depth of the tree.
  event GroupAdded(bytes32 indexed id, uint8 depth);

  /// @dev Emitted when a new identity commitment is added.
  /// @param groupId: Group id of the group.
  /// @param identityCommitment: New identity commitment.
  /// @param root: New root hash of the tree.
  event IdentityCommitmentAdded(bytes32 indexed groupId, uint256 identityCommitment, uint256 root);

  event ExternalNullifierAdded(uint232 externalNullifier);
  event ExternalNullifierRemoved(uint232 externalNullifier);
  event BroadcastPermissioningSet(bool status);

  // Whether broadcastSignal() can only be called by the owner of this
  // contract. This is the case as a safe default.
  bool public isBroadcastPermissioned = true;

  /// @dev Gets a group id and returns the group/tree data.
  mapping(bytes32 => IncrementalTreeData) private groups;

  /// @dev Gets a root hash and returns the group id.
  mapping(uint256 => bytes32) private rootHistory;

  /// @dev Gets a group id and returns the group admin address.
  mapping(bytes32 => address) private groupAdmins;

  // The external nullifier helps to prevent double-signaling by the same user.
  // We store the external nullifiers using a simple mapping of:
  mapping(uint232 => bool) private externalNullifiers;

  uint256 internal constant SNARK_SCALAR_FIELD =
    21888242871839275222246405745257275088548364400416034343698204186575808495617;

  // This value should be equal to
  // 0x7d10c03d1f7884c85edee6353bd2b2ffbae9221236edde3778eac58089912bc0
  // which you can calculate using the following ethersjs code:
  // ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')])
  // By setting the value of unset (empty) tree leaves to this
  // nothing-up-my-sleeve value, the authors hope to demonstrate that they do
  // not have its preimage and therefore cannot spend funds they do not own.
  uint256 internal constant TREE_ZERO_VALUE =
    uint256(keccak256(abi.encodePacked("SemaphoreGroups"))) % SNARK_SCALAR_FIELD;

  /*
   * If broadcastSignal is permissioned, check if msg.sender is the contract owner.
   */
  modifier onlyOwnerIfPermissioned() {
    require(!isBroadcastPermissioned || owner() == _msgSender(), "SemaphoreGroups: broadcast permission denied");

    _;
  }

  /// @dev Creates a new group by initializing the associated tree.
  /// @param _id: Id of the group.
  /// @param _depth: Depth of the tree.
  /// @param _admin: Admin of the group.
  function createGroup(
    bytes32 _id,
    uint8 _depth,
    address _admin
  ) external onlyOwner {
    require(groups[_id].depth == 0, "SemaphoreGroups: group already exists");

    groups[_id].init(_depth, TREE_ZERO_VALUE);

    groupAdmins[_id] = _admin;

    emit GroupAdded(_id, _depth);
  }

  /// @dev Adds an identity commitment to an existing group.
  /// @param _groupId: Id of the group.
  /// @param _identityCommitment: New identity commitment.
  function addIdentityCommitment(bytes32 _groupId, uint256 _identityCommitment) external {
    require(groups[_groupId].depth != 0, "SemaphoreGroups: group does not exist");
    require(groupAdmins[_groupId] == _msgSender(), "SemaphoreGroups: caller is not the group admin");

    groups[_groupId].insert(_identityCommitment);

    emit IdentityCommitmentAdded(_groupId, _identityCommitment, groups[_groupId].root);
  }

  /*
   * Broadcasts the signal.
   * @param _signal The signal to broadcast.
   * @param _root The root of the Merkle tree (the 1st public signal).
   * @param _nullifierHash The nullifier hash (the 2nd public signal).
   * @param _externalNullifier The external nullifiers hash (the 4th public signal).
   * @param _proof The proof elements.
   */
  function broadcastSignal(
    bytes memory _signal,
    uint256 _root,
    uint256 _nullifierHash,
    uint232 _externalNullifier,
    uint256[8] memory _proof
  ) public onlyOwnerIfPermissioned isValidProof(_signal, _root, _nullifierHash, _externalNullifier, _proof) {
    // Client contracts should be responsible for storing the signal and/or
    // emitting it as an event.

    // Check if the external nullifier exists.
    require(externalNullifiers[_externalNullifier], "SemaphoreGroups: the external nullifier does not exists");

    bytes32 groupId = rootHistory[_root];

    // Check if the given Merkle root exists.
    require(groups[groupId].depth != 0, "SemaphoreGroups: the root does not exist");
  }

  function addExternalNullifier(uint232 _externalNullifier) public onlyOwner {
    require(externalNullifiers[_externalNullifier], "SemaphoreGroups: the external nullifier already exists");

    externalNullifiers[_externalNullifier] = true;

    emit ExternalNullifierAdded(_externalNullifier);
  }

  function removeExternalNullifier(uint232 _externalNullifier) public onlyOwner {
    require(!externalNullifiers[_externalNullifier], "SemaphoreGroups: the external nullifier does not exists");

    externalNullifiers[_externalNullifier] = false;

    emit ExternalNullifierRemoved(_externalNullifier);
  }

  /// @dev Returns the last root hash of a group.
  /// @param _groupId: Id of the group.
  /// @return Root hash of the group.
  function getRoot(bytes32 _groupId) external view returns (uint256) {
    return groups[_groupId].root;
  }

  /// @dev Returns the size of a group.
  /// @param _groupId: Id of the group.
  /// @return Size of the group.
  function getSize(bytes32 _groupId) external view returns (uint256) {
    return groups[_groupId].numberOfLeaves;
  }

  function setBroadcastPermissioning(bool _status) public onlyOwner {
    isBroadcastPermissioned = _status;

    emit BroadcastPermissioningSet(_status);
  }
}
