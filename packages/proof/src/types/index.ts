export type BigNumberish = string | bigint

export type SnarkArtifacts = {
    wasmFilePath: string
    zkeyFilePath: string
}

export type Proof = {
    pi_a: BigNumberish[]
    pi_b: BigNumberish[][]
    pi_c: BigNumberish[]
    protocol: string
    curve: string
}

export type FullProof = {
    proof: Proof
    publicSignals: PublicSignals
}

export type PublicSignals = {
    signalHash: BigNumberish,
    externalNullifier: BigNumberish,
    // TODO: Fix roots
    roots: BigNumberish[],

    chainID: BigNumberish,
    calculatedRoot: BigNumberish,
    nullifierHash: BigNumberish
    // merkleRoot: BigNumberish
    // nullifierHash: BigNumberish
    // signalHash: BigNumberish
    // externalNullifier: BigNumberish
}

export type SolidityProof = [
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish
]
