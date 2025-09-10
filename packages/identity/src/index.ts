import type { Point } from "@zk-kit/baby-jubjub"
import { EdDSAPoseidon, type Signature, signMessage, verifySignature } from "@zk-kit/eddsa-poseidon"
import type { BigNumberish } from "@zk-kit/utils"
import { base64ToBuffer, bufferToBase64, textToBase64 } from "@zk-kit/utils/conversions"
import { isString } from "@zk-kit/utils/type-checks"
import { poseidon2 } from "poseidon-lite/poseidon2"

export type { Point }
export type { Signature }

/**
 * The Semaphore identity is essentially an {@link https://www.rfc-editor.org/rfc/rfc8032 | EdDSA}
 * public/private key pair. The {@link https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon | EdDSA implementation}
 * in this library uses {@link https://eips.ethereum.org/EIPS/eip-2494 | Baby Jubjub} for public key generation
 * and {@link https://www.poseidon-hash.info | Poseidon} for signatures.
 * In addition, the commitment, i.e. the hash of the public key, is used to represent
 * Semaphore identities in groups, adding an additional layer of privacy and security.
 * The private key of the identity can be exported as a base64 string.
 */
export class Identity {
    // The EdDSA private key, passed as a parameter or generated randomly.
    private _privateKey: string | Buffer | Uint8Array
    // The secret scalar derived from the private key.
    // It is used in circuits to derive the public key.
    private _secretScalar: bigint
    // The EdDSA public key, derived from the private key.
    private _publicKey: Point<bigint>
    // The identity commitment used as a public value in Semaphore groups.
    private _commitment: bigint

    /**
     * Initializes the class attributes based on a given private key, which must be text or a buffer.
     * If the private key is not passed as a parameter, a random private key will be generated.
     * The EdDSAPoseidon class is used to generate the secret scalar and the public key.
     * Additionally, the constructor computes a commitment of the public key using a hash function (Poseidon).
     *
     * @example
     * // Generates an identity.
     * const { privateKey, publicKey, commitment } = new Identity("private-key")
     * @example
     * // Generates an identity with a random private key.
     * const { privateKey, publicKey, commitment } = new Identity()
     *
     * @param privateKey The private key used to derive the public key (hexadecimal or string).
     */
    constructor(privateKey?: string | Buffer | Uint8Array) {
        const eddsa = new EdDSAPoseidon(privateKey)

        this._privateKey = eddsa.privateKey
        this._secretScalar = eddsa.secretScalar
        this._publicKey = eddsa.publicKey
        this._commitment = poseidon2(this._publicKey)
    }

    /**
     * Returns the private key.
     * @returns The private key as a buffer or text.
     */
    public get privateKey(): string | Buffer | Uint8Array {
        return this._privateKey
    }

    /**
     * Returns the secret scalar.
     * @returns The secret scalar as a bigint.
     */
    public get secretScalar(): bigint {
        return this._secretScalar
    }

    /**
     * Returns the public key as a Baby Jubjub {@link https://zkkit.pse.dev/types/_zk_kit_baby_jubjub.Point.html | Point}.
     * @returns The public key as a point.
     */
    public get publicKey(): Point<bigint> {
        return this._publicKey
    }

    /**
     * Returns the commitment hash of the public key.
     * @returns The commitment as a bigint.
     */
    public get commitment(): bigint {
        return this._commitment
    }

    /**
     * Returns the private key encoded as a base64 string.
     * @returns The private key as a base64 string.
     */
    public export(): string {
        if (isString(this._privateKey)) {
            return textToBase64(this._privateKey as string)
        }

        return bufferToBase64(this.privateKey as Buffer | Uint8Array)
    }

    /**
     * Returns a Semaphore identity based on a private key encoded as a base64 string.
     * The private key will be converted to a buffer, regardless of its original type.
     * @param privateKey The private key as a base64 string.
     * @returns The Semaphore identity.
     */
    static import(privateKey: string): Identity {
        return new Identity(base64ToBuffer(privateKey))
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
    public signMessage(message: BigNumberish): Signature<bigint> {
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

    /**
     * Generates the commitment from the given public key.
     * This static method is particularly useful after signature verification,
     * as it allows retrieval of the corresponding commitment associated with the public key.
     *
     * @example
     * const identity = new Identity()
     * Identity.generateCommitment(identity.publicKey)
     *
     * @param publicKey The public key to generate the commitment.
     * @returns The Semaphore identity commitment.
     */
    static generateCommitment(publicKey: Point): bigint {
        return poseidon2(publicKey)
    }
}
