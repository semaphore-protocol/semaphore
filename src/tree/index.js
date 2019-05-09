class MerkleTree {

  constructor(storage, hasher, n_levels, zero_value) {
    this.storage = storage;
    this.hasher = hasher;
    this.n_levels = n_levels;
    this.zero_values = [];

    let current_zero_value = zero_value;
    this.zero_values.push(current_zero_value);
    for (let i = 0; i < n_levels; i++) {
      current_zero_value = this.hasher.hash(i, current_zero_value, current_zero_value);
      this.zero_values.push(
        current_zero_value,
      );
    }
  }

  static index_to_key(level, index) {
    const key = `tree_${level}_${index}`;
    return key;
  }

  async path(index) {
    class PathTraverser {
      constructor(storage, zero_values) {
        this.storage = storage;
        this.zero_values = zero_values;
        this.path_elements = [];
        this.path_index = [];
      }

      async handle_index(level, element_index, sibling_index) {
        const sibling = await this.storage.get_or_element(
          MerkleTree.index_to_key(level, sibling_index),
          this.zero_values[level],
        );
        this.path_elements.push(sibling);
        this.path_index.push(element_index % 2);
      }
    }
    let traverser = new PathTraverser(this.storage, this.zero_values);
    let root = await this.storage.get_or_element(
      MerkleTree.index_to_key(this.n_levels, 0),
      this.zero_values[this.n_levels],
    );

    await this.traverse(index, traverser);
    return {
      root, 
      path_elements: traverser.path_elements, 
      path_index: traverser.path_index
    };
  }

  async update(index, element) {
    class UpdateTraverser {
      constructor(storage, hasher, element, zero_values) {
        this.current_element = element;
        this.zero_values = zero_values;
        this.storage = storage;
        this.hasher = hasher;
        this.key_values_to_put = [];
      }

      async handle_index(level, element_index, sibling_index) {
        const sibling = await this.storage.get_or_element(
          MerkleTree.index_to_key(level, sibling_index),
          this.zero_values[level],
        );
        let left, right;
        if (element_index % 2 == 0) {
          left = this.current_element;
          right = sibling;
        } else {
          left = sibling;
          right = this.current_element;
        }

        this.key_values_to_put.push({
          key: MerkleTree.index_to_key(level, element_index),
          value: this.current_element,
        });
        this.current_element = this.hasher.hash(level, left, right);
      }
    }
    let traverser = new UpdateTraverser(
      this.storage, 
      this.hasher,
      element,
      this.zero_values
    );
    await this.traverse(index, traverser);
    traverser.key_values_to_put.push({
      key: MerkleTree.index_to_key(this.n_levels, 0),
      value: traverser.current_element,
    });

    await this.storage.put_batch(traverser.key_values_to_put);
  }

  async traverse(index, handler) {
    let current_index = index;
    for (let i = 0; i < this.n_levels; i++) {
        let sibling_index = current_index;
        if (current_index % 2 == 0) {
          sibling_index += 1;
        } else {
          sibling_index -= 1;
        }
        await handler.handle_index(i, current_index, sibling_index);
        current_index = Math.floor(current_index / 2);
      }
  }
}

module.exports = MerkleTree;
