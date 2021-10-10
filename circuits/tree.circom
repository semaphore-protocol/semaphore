include "./hasherPoseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template CalculateTotal(n) {
    signal input nums[n];
    signal output sum;

    signal sums[n];
    sums[0] <== nums[0];

    for (var i=1; i < n; i++) {
        sums[i] <== sums[i - 1] + nums[i];
    }

    sum <== sums[n - 1];
}


template QuinSelector(choices) {
    signal input in[choices];
    signal input index;
    signal output out;
    
    component lessThan = LessThan(3);
    lessThan.in[0] <== index;
    lessThan.in[1] <== choices;
    lessThan.out === 1;

    component calcTotal = CalculateTotal(choices);
    component eqs[choices];

    for (var i = 0; i < choices; i ++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== i;
        eqs[i].in[1] <== index;
        calcTotal.nums[i] <== eqs[i].out * in[i];
    }

    out <== calcTotal.sum;
}

template Splicer(numItems) {

    var NUM_OUTPUT_ITEMS = numItems + 1;

    signal input in[numItems];
    signal input leaf;
    signal input index;
    signal output out[NUM_OUTPUT_ITEMS];

    component greaterThan[NUM_OUTPUT_ITEMS];
    component isLeafIndex[NUM_OUTPUT_ITEMS];
    component quinSelectors[NUM_OUTPUT_ITEMS];
    component muxes[NUM_OUTPUT_ITEMS];

    var i;
    var j;
    for (i = 0; i < numItems + 1; i ++) {
        greaterThan[i] = GreaterThan(3);
        greaterThan[i].in[0] <== i;
        greaterThan[i].in[1] <== index;

        quinSelectors[i] = QuinSelector(numItems + 1);
        quinSelectors[i].index <== i - greaterThan[i].out;

        for (j = 0; j < numItems; j ++) {
            quinSelectors[i].in[j] <== in[j];
        }
        quinSelectors[i].in[numItems] <== 0;

        isLeafIndex[i] = IsEqual();
        isLeafIndex[i].in[0] <== index;
        isLeafIndex[i].in[1] <== i;

        muxes[i] = Mux1();
        muxes[i].s <== isLeafIndex[i].out;
        muxes[i].c[0] <== quinSelectors[i].out;
        muxes[i].c[1] <== leaf;

        out[i] <== muxes[i].out;
    }
}

template QuinTreeInclusionProof(levels) {
    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    signal input leaf;
    signal input path_index[levels];
    signal input path_elements[levels][LEAVES_PER_PATH_LEVEL];
    signal output root;

    var i;
    var j;

    component hashers[levels];
    component splicers[levels];

    splicers[0] = Splicer(LEAVES_PER_PATH_LEVEL);
    hashers[0] = Hasher5();
    splicers[0].index <== path_index[0];
    splicers[0].leaf <== leaf;
    for (i = 0; i < LEAVES_PER_PATH_LEVEL; i++) {
        splicers[0].in[i] <== path_elements[0][i];
    }

    for (i = 0; i < LEAVES_PER_NODE; i++) {
        hashers[0].in[i] <== splicers[0].out[i];
    }

    for (i = 1; i < levels; i++) {
        splicers[i] = Splicer(LEAVES_PER_PATH_LEVEL);
        splicers[i].index <== path_index[i];
        splicers[i].leaf <== hashers[i - 1].hash;
        for (j = 0; j < LEAVES_PER_PATH_LEVEL; j ++) {
            splicers[i].in[j] <== path_elements[i][j];
        }

        hashers[i] = Hasher5();
        for (j = 0; j < LEAVES_PER_NODE; j ++) {
            hashers[i].in[j] <== splicers[i].out[j];
        }
    }
    
    root <== hashers[levels - 1].hash;
}
