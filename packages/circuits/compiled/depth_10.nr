use dep::std::hash::poseidon;
use dep::std::hash::poseidon::PoseidonHasher;
use dep::std::println;
use dep::std::eddsa::eddsa_to_pub;
use dep::std::ec::consts::te::baby_jubjub;

global LEVELS: Field = 10;

fn compute_merkle_root<N>(leaf: Field, indices: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = indices.to_be_bits(n as u32);
    let mut current = leaf;
    for i in 0..hash_path.len() {
        // if the path bit is 0, we are on the left
        // so we hash with the hash_path as (current, hash_path[i])
        // otherwise we hash with the hash_path as (hash_path[i], current)
        let (left, right) = if (index_bits[i] == 0) {
            (current, hash_path[i])
        } else {
            (hash_path[i], current)
        };
        // once we find a zero sibling, we will promote the current hash to the root
        if (hash_path[i] != 0) {
            current = poseidon::bn254::hash_2([left, right]);
        };
    }
    current
}

fn main(
    secret: Field,
    hash_path: [Field; LEVELS],
    indices: Field,
    nullifier: pub Field,
    root: pub Field,
) {
    let bjj = baby_jubjub();
    let pubkey = bjj.curve.mul(secret, bjj.base8);
    // println(pubkey_x);
    // println(pubkey_y);
    let identity = poseidon::bn254::hash_2([pubkey.x, pubkey.y]);
    // println("identity");
    // println(identity);

    // // compute the root of the merkle tree given the provided merkle merkle path
    // // and the reconstructed id commitment
    // // this can later be verified against a trusted root onchain or offchain
    assert(root == compute_merkle_root(identity, indices, hash_path));

    println(poseidon::bn254::hash_1([secret]));
    // // the nullifier hash allows us to check how often a given identity signaled per topic
    // // every topic should use a distinct external nullifier
    assert(nullifier == poseidon::bn254::hash_1([secret]));
}

// #[test]
// fn test_hash() {
//     // check against the reference implementation
//     let s = main(0x16b051f37589e0dcf4ad3c415c090798c10d3095bedeedabfcc709ad787f3507,0x062800ac9e60839fab9218e5ed9d541f4586e41275f4071816a975895d349a5e, 0x103aef72f9b558b77ab0fdf910f2e8fdb1aaf91cbb629cdc46cd79dab1c5e8b4);
// }
