import { BigNumber } from "@ethersproject/bignumber"
import checkParameter from "./checkParameter"
import hash from "./hash"
import { generateCommitment, genRandomNumber, isJsonArray } from "./utils"

export default class Identity {
    private _trapdoor: bigint
    private _nullifier: bigint
    private _commitment: bigint

    /**
     * Initializes the class attributes based on the strategy passed as parameter.
     * @param identityOrMessage Additional data needed to create identity for given strategy.
     */
    constructor(identityOrMessage?: string) {
        if (identityOrMessage === undefined) {
            this._trapdoor = genRandomNumber()
            this._nullifier = genRandomNumber()
            this._commitment = generateCommitment(this._nullifier, this._trapdoor)

            return
        }

        checkParameter(identityOrMessage, "identityOrMessage", "string")

        if (!isJsonArray(identityOrMessage)) {
            const messageHash = hash(identityOrMessage)

            this._trapdoor = hash(`${messageHash}identity_trapdoor`)
            this._nullifier = hash(`${messageHash}identity_nullifier`)
            this._commitment = generateCommitment(this._nullifier, this._trapdoor)

            return
        }

        const [trapdoor, nullifier] = JSON.parse(identityOrMessage)

        this._trapdoor = BigNumber.from(trapdoor).toBigInt()
        this._nullifier = BigNumber.from(nullifier).toBigInt()
        this._commitment = generateCommitment(this._nullifier, this._trapdoor)
    }

    /**
     * Returns the identity trapdoor.
     * @returns The identity trapdoor.
     */
    public get trapdoor(): bigint {
        return this._trapdoor
    }

    /**
     * Returns the identity trapdoor.
     * @returns The identity trapdoor.
     */
    public getTrapdoor(): bigint {
        return this._trapdoor
    }

    /**
     * Returns the identity nullifier.
     * @returns The identity nullifier.
     */
    public get nullifier(): bigint {
        return this._nullifier
    }

    /**
     * Returns the identity nullifier.
     * @returns The identity nullifier.
     */
    public getNullifier(): bigint {
        return this._nullifier
    }

    /**
     * Returns the identity commitment.
     * @returns The identity commitment.
     */
    public get commitment(): bigint {
        return this._commitment
    }

    /**
     * Returns the identity commitment.
     * @returns The identity commitment.
     */
    public getCommitment(): bigint {
        return this._commitment
    }

    /**
     * Returns a JSON string with trapdoor and nullifier. It can be used
     * to export the identity and reuse it later.
     * @returns The string representation of the identity.
     */
    public toString(): string {
        return JSON.stringify([`0x${this._trapdoor.toString(16)}`, `0x${this._nullifier.toString(16)}`])
    }
}
