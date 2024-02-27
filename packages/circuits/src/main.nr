use dep::std;
global LEVELS: Field = 16;

// wrappers around poseidon hash equivalent to the circom implementation
fn hash_1(input: Field) -> Field {
    std::hash::poseidon::bn254::hash_1([input])
}
fn hash_2(input: [Field; 2]) -> Field {
    std::hash::poseidon::bn254::hash_2(input)
}

// same as stds::merkle::compute_merkle_root but using poseidon hash
fn compute_merkle_root(leaf: Field, index: Field, hash_path: [Field; LEVELS]) -> Field {
    let index_bits = index.to_le_bits(LEVELS as u32);
    let mut current = leaf;
    for i in 0..LEVELS {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };

        current = hash_2([hash_left, hash_right]);
    }
    current
}

fn main(
    id_nullifier: Field,
    id_trapdoor: Field,
    siblings: [Field; LEVELS],
    indices: Field,
    external_nullifier: pub Field,
    root: pub Field,
    nullifier_hash: pub Field,
    signal_hash: pub Field
) {
    // reconstruct the commitment from the private nullfiers
    let secret = hash_2([id_nullifier, id_trapdoor]);
    let id_commitment = hash_1(secret);

    // compute the root of the merkle tree given the provided merkle merkle path
    // and the reconstructed id commitment
    // this can later be verified against a trusted root onchain or offchain
    assert(root == compute_merkle_root(id_commitment, indices, siblings));

    // the nullifier hash allows us to check how often a given identity signaled per topic
    // every topic should use a distinct external nullifier
    assert(nullifier_hash == hash_2([external_nullifier, id_nullifier]));
    assert(signal_hash * signal_hash == signal_hash * signal_hash);
}

#[test]
fn test_hash() {
    // check against circom poseidon implementation
    assert(hash_2([1, 2]) == 0x115cc0f5e7d690413df64c6b9662e9cf2a3617f2743245519e19607a4417189a);
}
