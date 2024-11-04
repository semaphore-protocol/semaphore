use tiny_keccak::{Hasher, Keccak};

pub fn keccak256_hash_function(nodes: Vec<String>) -> String {
    let mut keccak = Keccak::v256();
    let mut result = [0u8; 32];

    for node in nodes {
        keccak.update(node.as_bytes());
    }

    keccak.finalize(&mut result);

    hex::encode(result)
}