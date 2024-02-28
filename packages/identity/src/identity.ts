import {
    BigNumberish,
    Point,
    Signature,
    derivePublicKey,
    deriveSecretScalar,
    signMessage,
    verifySignature
} from "@zk-kit/eddsa-poseidon"
import { poseidon2 } from "poseidon-lite/poseidon2"
import { randomNumber } from "./random-number.node"

/**
 * The Semaphore identity is essentially an {@link https://www.rfc-editor.org/rfc/rfc8032 | EdDSA}
 * public/private key pair. The {@link https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon | EdDSA implementation}
 * in this library uses {@link https://eips.ethereum.org/EIPS/eip-2494 | Baby Jubjub} for public key generation
 * and {@link https://www.poseidon-hash.info | Poseidon} for signatures.
 * In addition, the commitment, i.e. the hash of the public key, is used to represent
 * Semaphore identities in groups, adding an additional layer of privacy and security.
 */
export default class Identity {
    // The EdDSA private key, passed as a parameter or generated randomly.
    private _privateKey: BigNumberish
    // The secret scalar derived from the private key.
    // It is used in circuits to derive the public key.
    private _secretScalar: string
    // The EdDSA public key, derived from the private key.
    private _publicKey: Point<string>
    // The identity commitment used as a public value in Semaphore groups.
    private _commitment: string

    /**
     * Initializes the class attributes based on a given private key.
     * If the private key is not passed as a parameter, a random key is generated.
     * The constructor calculates the secret scalar and public key from the private key,
     * and computes a commitment of the public key using a hash function (Poseidon).
     *
     * @example
     * // Generates an identity.
     * const { privateKey, publicKey, commitment } = new Identity("private-key")
     * @example
     * // Generates an identity with a random private key.
     * const { privateKey, publicKey, commitment } = new Identity()
     *
     * @param privateKey The private key used to derive the public key.
     */
    constructor(privateKey: BigNumberish = randomNumber().toString()) {
        this._privateKey = privateKey
        this._secretScalar = deriveSecretScalar(privateKey)
        this._publicKey = derivePublicKey(privateKey)
        this._commitment = poseidon2(this._publicKey).toString()
    }

    /**
     * Returns the private key.
     * @returns The private key as a {@link https://zkkit.pse.dev/types/_zk_kit_utils.BigNumberish.html | BigNumberish}.
     */
    public get privateKey(): BigNumberish {
        return this._privateKey
    }

    /**
     * Returns the secret scalar.
     * @returns The secret scalar as a string.
     */
    public get secretScalar(): string {
        return this._secretScalar
    }

    /**
     * Returns the public key as a Baby Jubjub {@link https://zkkit.pse.dev/types/_zk_kit_baby_jubjub.Point.html | Point}.
     * @returns The public key as a point.
     */
    public get publicKey(): Point<string> {
        return this._publicKey
    }

    /**
     * Returns the commitment hash of the public key.
     * @returns The commitment as a string.
     */
    public get commitment(): string {
        return this._commitment
    }

    /**
     * Generates a signature for a given message using the private key.
     * This method demonstrates how to sign a message and could be used
     * for authentication or data integrity.
     *
     * @example
     * const identity = new Identity()
     * const signature = identity.signMessage("message")
     *
     * @param message The message to be signed.
     * @returns A {@link https://zkkit.pse.dev/types/_zk_kit_eddsa_poseidon.Signature.html | Signature} object containing the signature components.
     */
    public signMessage(message: BigNumberish): Signature<string> {
        return signMessage(this.privateKey, message)
    }

    /**
     * Verifies a signature against a given message and public key.
     * This static method allows for the verification of signatures without needing
     * an instance of the Identity class. It's useful for cases where you only have
     * the public key, the message and a signature, and need to verify if they match.
     *
     * @example
     * const identity = new Identity()
     * const signature = identity.signMessage("message")
     * Identity.verifySignature("message", signature, identity.publicKey)
     *
     * @param message The message that was signed.
     * @param signature The signature to verify.
     * @param publicKey The public key to use for verification.
     * @returns A boolean indicating whether the signature is valid.
     */
    static verifySignature(message: BigNumberish, signature: Signature, publicKey: Point): boolean {
        return verifySignature(message, signature, publicKey)
    }
}
