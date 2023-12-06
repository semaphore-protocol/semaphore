import {
    BigNumber,
    BigNumberish,
    Point,
    Signature,
    derivePublicKey,
    deriveSecretScalar,
    packPublicKey,
    signMessage,
    unpackPublicKey,
    verifySignature
} from "@zk-kit/eddsa-poseidon"
import { randomBytes } from "crypto"

export default class Identity {
    private _privateKey: BigNumberish
    private _secretScalar: string
    private _unpackedPublicKey: Point<string>
    private _publicKey: string

    /**
     * Initializes the class attributes based on the parameters.
     * @param privateKey The secret value used to generate an EdDSA public key.
     */
    constructor(privateKey: BigNumberish = randomBytes(32)) {
        this._privateKey = privateKey
        this._secretScalar = deriveSecretScalar(privateKey)

        this._unpackedPublicKey = derivePublicKey(privateKey)

        this._publicKey = packPublicKey(this._unpackedPublicKey) as string
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
    public get publicKey(): string {
        return this._publicKey
    }

    /**
     * Returns the unpacked public key.
     * @returns The unpacked public key.
     */
    public get unpackedPublicKey(): Point<string> {
        return this._unpackedPublicKey
    }

    public signMessage(message: BigNumberish): Signature<string> {
        return signMessage(this.privateKey, message)
    }

    public verifySignature(message: BigNumberish, signature: Signature): boolean {
        return verifySignature(message, signature, this._unpackedPublicKey)
    }

    static verifySignature(message: BigNumberish, signature: Signature, publicKey: BigNumber | Point): boolean {
        if (typeof publicKey === "string" || typeof publicKey === "bigint") {
            publicKey = unpackPublicKey(publicKey)
        }

        return verifySignature(message, signature, publicKey)
    }
}
