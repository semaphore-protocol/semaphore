import {
    BigNumberish,
    Point,
    Signature,
    derivePublicKey,
    deriveSecretScalar,
    signMessage,
    verifySignature
} from "@zk-kit/eddsa-poseidon"
import { randomBytes } from "crypto"
import { poseidon2 } from "poseidon-lite/poseidon2"

export default class Identity {
    private _privateKey: BigNumberish
    private _secretScalar: string
    private _publicKey: Point<string>
    private _identityCommitment: string

    /**
     * Initializes the class attributes based on the parameters.
     * @param privateKey The secret value used to generate an EdDSA public key.
     */
    constructor(privateKey: BigNumberish = randomBytes(32)) {
        this._privateKey = privateKey
        this._secretScalar = deriveSecretScalar(privateKey)

        this._publicKey = derivePublicKey(privateKey)

        this._identityCommitment = poseidon2(this._publicKey).toString()
    }

    /**
     * Returns the private key.
     * @returns The private key.
     */
    public get privateKey(): BigNumberish {
        return this._privateKey
    }

    /**
     * Returns the secret scalar.
     * @returns The secret scalar.
     */
    public get secretScalar(): string {
        return this._secretScalar
    }

    /**
     * Returns the public key.
     * @returns The public key.
     */
    public get publicKey(): Point<string> {
        return this._publicKey
    }

    /**
     * Returns the identity commitment.
     * @returns The identity commitment.
     */
    public get identityCommitment(): string {
        return this._identityCommitment
    }

    public signMessage(message: BigNumberish): Signature<string> {
        return signMessage(this.privateKey, message)
    }

    public verifySignature(message: BigNumberish, signature: Signature): boolean {
        return verifySignature(message, signature, this._publicKey)
    }

    static verifySignature(message: BigNumberish, signature: Signature, publicKey: Point): boolean {
        return verifySignature(message, signature, publicKey)
    }
}
