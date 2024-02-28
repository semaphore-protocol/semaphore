use dep::std::hash::poseidon2::Poseidon2;
use dep::std::println;

global LEVELS: Field = 16;

// same as stds::merkle::compute_merkle_root but using poseidon hash
fn compute_merkle_root<N>(leaf: Field, index: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    for i in 0..n {
        println(current);
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };
        current = Poseidon2::hash([hash_left, hash_right], 2);
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
    let secret = Poseidon2::hash([id_nullifier, id_trapdoor], 2);
    let id_commitment = Poseidon2::hash([secret], 1);

    // compute the root of the merkle tree given the provided merkle merkle path
    // and the reconstructed id commitment
    // this can later be verified against a trusted root onchain or offchain
    assert(root == compute_merkle_root(id_commitment, indices, siblings));

    // the nullifier hash allows us to check how often a given identity signaled per topic
    // every topic should use a distinct external nullifier
    assert(nullifier_hash == Poseidon2::hash([external_nullifier, id_nullifier], 2));
    assert(signal_hash * signal_hash == signal_hash * signal_hash);
}

#[test]
fn test_hash() {
    // check against the reference implementation
    let s = Poseidon2::hash(
        [
        0x24696f29dc2ef79a8dc176e566c61d7e83d8e823c8b3570c0b9f08adf0c5fda0,
        0x2710144414c3a5f2354f4c08d52ed655b9fe253b4bf12cb9ad3de693d9b1db11
    ],
        2
    );
    println(s);
    assert(s == 0x1f90601d6a45db255dd53d23d72150edbd4d62d7c37855bcd3cd112984ee35fd);
    let c = Poseidon2::hash([s], 1);
    println(c);
    assert(c == 0x00177e58e388e3252f87eb7199f35a4baf6c2dba41427b12e82b47b8e6fb0f3d);
}
