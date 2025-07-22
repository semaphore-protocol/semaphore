pragma circom 2.1.5;

include "babyjub.circom";
include "poseidon.circom";
include "binary-merkle-root.circom";
include "comparators.circom";

// The Semaphore circuit can be divided into 3 main parts.
// The first part involves the generation of the Semaphore identity,
// i.e. the public key and its hash, which is called the commitment
// and is used as a public value.
// In the second part, it is verified whether or not the identity commitment is part
// of the Merkle tree, i.e. the Semaphore group. That is, a proof of membership is verified.
// The third part covers the generation of a nullifier, i.e. the hash of the scope of the proof
// and the secret used to derive the public key (secret scalar). The nullifier is used to prevent the same
// proof from being verified twice.
// The circuit lastly includes the message, which is an arbitrary anonymous value defined by
// the user, or the hash of that value.
template Semaphore(MAX_DEPTH) {
    // Input signals.
    // The input signals are all private except 'message' and 'scope'.
    // The secret is the scalar generated from the EdDSA private key.
    // Using the secret scalar instead of the private key allows this circuit
    // to skip steps 1, 2, 3 in the generation of the public key defined here:
    // https://www.rfc-editor.org/rfc/rfc8032#section-5.1.5, making the circuit
    // more efficient and simple.
    // See the Semaphore identity package to know more about how the identity is generated:
    // https://github.com/semaphore-protocol/semaphore/tree/main/packages/identity.
    signal input secret;
    signal input merkleProofLength, merkleProofIndex, merkleProofSiblings[MAX_DEPTH];
    signal input message;
    signal input scope;

    // Output signals.
    // The output signals are all public.
    signal output merkleRoot, nullifier;

    // The secret scalar must be in the prime subgroup order 'l'.
    var l = 2736030358979909402780800718157159386076813972158567259200215660948447373041;

    component isLessThan = LessThan(251);
    isLessThan.in <== [secret, l];
    isLessThan.out === 1;

    // Identity generation.
    // The circuit derives the EdDSA public key from a secret using
    // Baby Jubjub (https://eips.ethereum.org/EIPS/eip-2494),
    // which is basically nothing more than a point with two coordinates.
    // It then calculates the hash of the public key, which is used
    // as the commitment, i.e. the public value of the Semaphore identity.
    var Ax, Ay;
    (Ax, Ay) = BabyPbk()(secret);

    var identityCommitment = Poseidon(2)([Ax, Ay]);

    // Proof of membership verification.
    // The Merkle root passed as output must be equal to that calculated within
    // the circuit through the inputs of the Merkle proof.
    // See https://github.com/privacy-scaling-explorations/zk-kit.circom/blob/main/packages/binary-merkle-root/src/binary-merkle-root.circom
    // to know more about how the 'BinaryMerkleRoot' template works.
    merkleRoot <== BinaryMerkleRoot(MAX_DEPTH)(identityCommitment, merkleProofLength, merkleProofIndex, merkleProofSiblings);

    // Nullifier generation.
    // The nullifier is a value that essentially identifies the proof generated in a specific scope
    // and by a specific identity, so that externally anyone can check if another proof with the same
    // nullifier has already been generated. This mechanism can be particularly useful in cases
    // where one wants to prevent double-spending or double-voting, for example.
    nullifier <== Poseidon(2)([scope, secret]);

    // The message is not really used within the circuit.
    // The square applied to it is a way to force Circom's compiler to add a constraint and
    // prevent its value from being changed by an attacker.
    // More information here: https://geometry.xyz/notebook/groth16-malleability.
    signal dummySquare <== message * message;
}
