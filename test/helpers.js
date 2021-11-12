const { poseidon } = require('circomlibjs');

module.exports = {
    // temporary replacement of @libsem/protocols.genNullifierHash that expects
    // `n_levels` (which is no longer a part of the nullifier) as the 3rd param.
    genNullifierHash: (externalNullifier, nullifier) =>
        poseidon([BigInt(externalNullifier), BigInt(nullifier)]),
}
