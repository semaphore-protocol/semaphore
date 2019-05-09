const chai = require('chai');
const snarkjs = require('snarkjs');
const circomlib = require('circomlib');

const bigInt = snarkjs.bigInt;

const mimc7 = circomlib.mimc7;

let build_merkle_tree_example = (n_levels, identity_commitment) => {
    let current_index = 0;
    let path_index = [];
    let path_elements = [];
    let current_element = identity_commitment;
    for (let i = 0; i < n_levels; i++) {
      path_elements.push(bigInt(0));
      current_element = mimc7.multiHash([ current_element, 0 ]);

      path_index.push(current_index % 2);
      current_index = Math.floor(current_index / 2);
    }

    const root = current_element;

    return [root, path_elements, path_index];
};

let build_full_merkle_tree_example = (n_levels, index, identity_commitment) => {
    let tree = [];
    let current_index = index;
    let path_index = [];
    let path_elements = [];
    for (let i = 0; i < n_levels; i++) {
      let tree_level = [];
      path_index.push(current_index % 2);
      for (let j = 0; j < Math.pow(2, n_levels - i); j++) {
        if (i == 0) {
          if (j == index) {
            tree_level.push(identity_commitment);
          } else {
            tree_level.push(bigInt(j));
          }
        } else {
          tree_level.push(mimc7.multiHash([ tree[i-1][2*j], tree[i-1][2*j+1] ]));
        }
      }
      if (current_index % 2 == 0) {
        path_elements.push(tree_level[current_index + 1]);
      } else {
        path_elements.push(tree_level[current_index - 1]);
      }

      tree.push(tree_level);
      current_index = Math.floor(current_index / 2);
    }

    const root = mimc7.multiHash([ tree[n_levels - 1][0], tree[n_levels - 1][1] ]);

    return [root, tree, path_elements, path_index];
};

module.exports = {
    build_merkle_tree_example,
}
