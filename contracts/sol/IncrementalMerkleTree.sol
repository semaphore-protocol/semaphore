/*
 * Semaphore - Zero-knowledge signaling on Ethereum
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com> and Koh Wei Jie
 * (contact@kohweijie.com)
 *
 * This file is part of Semaphore.
 *
 * Semaphore is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Semaphore is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Semaphore.  If not, see <http://www.gnu.org/licenses/>.
 */

pragma solidity ^0.5.0;

library MiMC {
    function MiMCSponge(uint256 in_xL, uint256 in_xR) pure public 
               returns (uint256 xL, uint256 xR);
}

contract IncrementalMerkleTree {
    uint256 constant order =  21888242871839275222246405745257275088548364400416034343698204186575808495617;

    // The tree depth
    uint8 internal treeLevels;

    // The number of inserted leaves
    uint32 internal nextLeafIndex = 0;

    // The Merkle root
    uint256 internal treeRoot;

    // The Merkle path to the leftmost leaf upon initialisation. It *should
    // not* be modified after it has been set by the `initMerkleTree` function.
    // Caching these values is essential to efficient appends.
    uint256[] zeros;

    // Allows you to compute the path to the element (but it's not the path to
    // the elements). Caching these values is essential to efficient appends.
    uint256[] filledSubtrees;

    event LeafInsertion(uint256 indexed leaf, uint32 indexed leafIndex);

    /*
     * Store the Merkle root and intermediate values (the Merkle path to the
     * the first leaf) assuming that all leaves are set to _zeroValue.
     * @param _treeLevels The number of levels of the tree
     * @param _zeroValue The value to set for every leaf
     */
    function initMerkleTree(uint8 _treeLevels, uint256 _zeroValue) internal {
        /*
           To initialise the Merkle tree, we need to calculate the Merkle root
           assuming that every leaf is 0 (a = b = c = d = 0)

            H(H(a,b), H(c,d))
             /             \
            H(a,b)        H(c,d)
             /   \        /    \
            a     b      c      d

           `zeros` and `filledSubtrees` will come in handly later when we do
           inserts or updates. e.g when we insert a value in index 1, we will
           need to look up values from those arrays to recalculate the Merkle
           root.
         */
        treeLevels = _treeLevels;

        // zeroes is in storage, while currentZeros is in memory
        uint256[] memory currentZeros = new uint256[](_treeLevels);

        // write to currentZeros
        currentZeros[0] = _zeroValue;
        for (uint8 i = 1; i < _treeLevels; i++) {
            uint256 currentZero = currentZeros[i-1];
            uint256 hashed = hashLeftRight(currentZero, currentZero);
            currentZeros[i] = hashed;
        }

        // store the in-memory currentZeros array to zeros and filledSubtrees
        zeros = currentZeros;
        filledSubtrees = currentZeros;

        uint256 lastZero = zeros[_treeLevels - 1];
        treeRoot = hashLeftRight(lastZero, lastZero);
    }

    function insertLeaf(uint256 _leaf) internal {
        require(
            _leaf < order,
            "MerkleTreeLib: insertLeaf argument must be < order"
        );

        uint32 currentIndex = nextLeafIndex;

        uint32 depth = treeLevels;
        if (depth == 32) {
            // uint32(2) ** 32 overflows to 0, so if the depth is 32, we have
            // to limit the number of leaves to (2 ** 32 - 1)
            require(
                currentIndex <= uint32(2) ** depth - 1,
                "MerkleTreeLib: tree is full (depth 32)"
            );

        } else {
            require(
                currentIndex <= uint32(2) ** depth,
                "MerkleTreeLib: tree is full"
            );
        }

        uint256 currentLevelHash = _leaf;
        uint256 left;
        uint256 right;

        for (uint8 i = 0; i < treeLevels; i++) {
            // if current_index is 5, for instance, over the iterations it will look like this:
            // 5, 2, 1, 0, 0, 0 ...

            if (currentIndex % 2 == 0) {
                // For later values of `i`, use the prevous hash as `left`, and
                // the (hashed) zero value for `right`
                left = currentLevelHash;
                right = zeros[i];

                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }

            currentLevelHash = hashLeftRight(left, right);

            currentIndex /= 2;
        }

        treeRoot = currentLevelHash;
        nextLeafIndex += 1;

        emit LeafInsertion(_leaf, currentIndex);
    }

    /*
     * @return The current tree root
     */
    function getTreeRoot() public view returns (uint256) {
        return treeRoot;
    }

    /*
     * Concatenates and hashes two `uint256` values (left and right) using
     * a combination of MiMCSponge and `addmod`.
     * @param _left The first value
     * @param _right The second value
     * @return The uint256 hash of _left and _right
     */
    function hashLeftRight(uint256 _left, uint256 _right) public pure returns (uint256 mimc_hash) {
        uint256 R = 0;
        uint256 C = 0;

        // Solidity documentation states:
        // `addmod(uint x, uint y, uint k) returns (uint)`:
        // compute (x + y) % k where the addition is performed with arbitrary
        // precision and does not wrap around at 2**256. Assert that k != 0
        // starting from version 0.5.0.

        R = _left;
        (R, C) = MiMC.MiMCSponge(R, C);

        R = addmod(R, _right, order);
        (R, C) = MiMC.MiMCSponge(R, C);

        mimc_hash = R;
    }
}
