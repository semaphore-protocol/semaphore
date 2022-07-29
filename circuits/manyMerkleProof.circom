pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "./membership.circom";

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices bits is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template ManyMerkleProof(levels, length) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input roots[length];
    signal input isEnabled;
    signal output root;

    component switcher[levels];
    component hasher[levels];

    /* component indexBits = Num2Bits(levels); */
    /* indexBits.in <== pathIndices; */

    for (var i = 0; i < levels; i++) {
        switcher[i] = Switcher();
        switcher[i].L <== i == 0 ? leaf : hasher[i - 1].out;
        switcher[i].R <== pathElements[i];
        switcher[i].sel <== pathIndices[i];

        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== switcher[i].outL;
        hasher[i].inputs[1] <== switcher[i].outR;
    }

    // verify that the resultant hash (computed merkle root)
    // is in the set of roots
    component set = SetMembership(length);
    for (var i = 0; i < length; i++) {
        set.set[i] <== roots[i];
    }
    set.element <== hasher[levels - 1].out;
    root <== hasher[levels - 1].out;
}
