//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {SnarkConstants} from "./SnarkConstants.sol";
import {Hasher} from "./Hasher.sol";
import {Ownable} from "./Ownable.sol";

/*
 * An incremental Merkle tree which supports up to 5 leaves per node.
 */
contract IncrementalQuinTree is Ownable, Hasher {
  // The maximum tree depth
  uint8 internal constant MAX_DEPTH = 32;

  // The number of leaves per node
  uint8 internal constant LEAVES_PER_NODE = 5;

  // The tree depth
  uint8 internal treeLevels;

  // The number of inserted leaves
  uint256 internal nextLeafIndex = 0;

  // The Merkle root
  uint256 public root;

  // The zero value per level
  mapping(uint256 => uint256) internal zeros;

  // Allows you to compute the path to the element (but it's not the path to
  // the elements). Caching these values is essential to efficient appends.
  mapping(uint256 => mapping(uint256 => uint256)) internal filledSubtrees;

  // Whether the contract has already seen a particular Merkle tree root
  mapping(uint256 => bool) public rootHistory;

  event LeafInsertion(uint256 indexed leaf, uint256 indexed leafIndex);

  /*
   * Stores the Merkle root and intermediate values (the Merkle path to the
   * the first leaf) assuming that all leaves are set to _zeroValue.
   * @param _treeLevels The number of levels of the tree
   * @param _zeroValue The value to set for every leaf. Ideally, this should
   *                   be a nothing-up-my-sleeve value, so that nobody can
   *                   say that the deployer knows the preimage of an empty
   *                   leaf.
   */
  constructor(uint8 _treeLevels, uint256 _zeroValue) {
    // Limit the Merkle tree to MAX_DEPTH levels
    require(_treeLevels > 0 && _treeLevels <= MAX_DEPTH, "IncrementalQuinTree: _treeLevels must be between 0 and 33");

    /*
           To initialise the Merkle tree, we need to calculate the Merkle root
           assuming that each leaf is the zero value.
           `zeros` and `filledSubtrees` will come in handy later when we do
           inserts or updates. e.g when we insert a value in index 1, we will
           need to look up values from those arrays to recalculate the Merkle
           root.
         */
    treeLevels = _treeLevels;

    uint256 currentZero = _zeroValue;

    // hash5 requires a uint256[] memory input, so we have to use temp
    uint256[LEAVES_PER_NODE] memory temp;

    for (uint8 i = 0; i < _treeLevels; i++) {
      for (uint8 j = 0; j < LEAVES_PER_NODE; j++) {
        temp[j] = currentZero;
      }

      zeros[i] = currentZero;
      currentZero = hash5(temp);
    }

    root = currentZero;
  }

  /*
   * Inserts a leaf into the Merkle tree and updates its root.
   * Also updates the cached values which the contract requires for efficient
   * insertions.
   * @param _leaf The value to insert. It must be less than the snark scalar
   *              field or this function will throw.
   * @return The leaf index.
   */
  function insertLeaf(uint256 _leaf) public onlyOwner returns (uint256) {
    require(_leaf < SNARK_SCALAR_FIELD, "IncrementalQuinTree: insertLeaf argument must be < SNARK_SCALAR_FIELD");

    // Ensure that the tree is not full
    require(nextLeafIndex < uint256(LEAVES_PER_NODE)**uint256(treeLevels), "IncrementalQuinTree: tree is full");

    uint256 currentIndex = nextLeafIndex;

    uint256 currentLevelHash = _leaf;

    // hash5 requires a uint256[] memory input, so we have to use temp
    uint256[LEAVES_PER_NODE] memory temp;

    // The leaf's relative position within its node
    uint256 m = currentIndex % LEAVES_PER_NODE;

    for (uint8 i = 0; i < treeLevels; i++) {
      // If the leaf is at relative index 0, zero out the level in
      // filledSubtrees
      if (m == 0) {
        for (uint8 j = 1; j < LEAVES_PER_NODE; j++) {
          filledSubtrees[i][j] = zeros[i];
        }
      }

      // Set the leaf in filledSubtrees
      filledSubtrees[i][m] = currentLevelHash;

      // Hash the level
      for (uint8 j = 0; j < LEAVES_PER_NODE; j++) {
        temp[j] = filledSubtrees[i][j];
      }
      currentLevelHash = hash5(temp);

      currentIndex /= LEAVES_PER_NODE;
      m = currentIndex % LEAVES_PER_NODE;
    }

    root = currentLevelHash;
    rootHistory[root] = true;

    uint256 n = nextLeafIndex;
    nextLeafIndex += 1;

    emit LeafInsertion(_leaf, n);

    return currentIndex;
  }
}
