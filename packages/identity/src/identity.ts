import { BigNumber } from "@ethersproject/bignumber"
import { poseidon } from "circomlibjs"
import checkParameter from "./checkParameter"
import { genRandomNumber, isJsonArray, sha256 } from "./utils"

export default class Identity {
    private _trapdoor: bigint
    private _nullifier: bigint

    /**
     * Initializes the class attributes based on the strategy passed as parameter.
     * @param identityOrMessage Additional data needed to create identity for given strategy.
     */
    constructor(identityOrMessage?: string) {
        if (identityOrMessage === undefined) {
            this._trapdoor = genRandomNumber()
            this._nullifier = genRandomNumber()

            return
        }

        checkParameter(identityOrMessage, "identityOrMessage", "string")

        if (!isJsonArray(identityOrMessage)) {
            const messageHash = sha256(identityOrMessage).slice(2)

            this._trapdoor = BigNumber.from(sha256(`${messageHash}identity_trapdoor`)).toBigInt()
            this._nullifier = BigNumber.from(sha256(`${messageHash}identity_nullifier`)).toBigInt()

            return
        }

        const [trapdoor, nullifier] = JSON.parse(identityOrMessage)

        this._trapdoor = BigNumber.from(`0x${trapdoor}`).toBigInt()
        this._nullifier = BigNumber.from(`0x${nullifier}`).toBigInt()
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
    public getNullifier(): bigint {
        return this._nullifier
    }

    /**
     * Generates the identity commitment from trapdoor and nullifier.
     * @returns identity commitment
     */
    public generateCommitment(): bigint {
        return poseidon([poseidon([this._nullifier, this._trapdoor])])
    }

    /**
     * Returns a JSON string with trapdoor and nullifier. It can be used
     * to export the identity and reuse it later.
     * @returns The string representation of the identity.
     */
    public toString(): string {
        return JSON.stringify([this._trapdoor.toString(16), this._nullifier.toString(16)])
    }
}
