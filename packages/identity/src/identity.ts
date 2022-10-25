import { BigNumber } from "@ethersproject/bignumber"
import { poseidon } from "circomlibjs"
import checkParameter from "./checkParameter"
<<<<<<< HEAD
import { genRandomNumber, isJsonArray, sha256 } from "./utils"
=======
import { generateCommitment, genRandomNumber, isJsonArray, sha256 } from "./utils"
>>>>>>> origin/main

export default class Identity {
  private _trapdoor: bigint
  private _nullifier: bigint
<<<<<<< HEAD
  private _chainID: bigint
=======
    private _commitment: bigint
>>>>>>> origin/main

  /**
   * Initializes the class attributes based on the strategy passed as parameter.
   * @param identityOrMessage Additional data needed to create identity for given strategy.
   */
<<<<<<< HEAD
  constructor(chainID: bigint, identityOrMessage?: string) {
    this._chainID = chainID

    if (identityOrMessage === undefined) {
      this._trapdoor = genRandomNumber()
      this._nullifier = genRandomNumber()
=======
    constructor(identityOrMessage?: string) {
        if (identityOrMessage === undefined) {
            this._trapdoor = genRandomNumber()
            this._nullifier = genRandomNumber()
            this._commitment = generateCommitment(this._nullifier, this._trapdoor)
>>>>>>> origin/main

      return
    }

    checkParameter(identityOrMessage, "identityOrMessage", "string")

    if (!isJsonArray(identityOrMessage)) {
      const messageHash = sha256(identityOrMessage).slice(2)

<<<<<<< HEAD
      this._trapdoor = BigNumber.from(
        sha256(`${messageHash}identity_trapdoor`)
      ).toBigInt()
      this._nullifier = BigNumber.from(
        sha256(`${messageHash}identity_nullifier`)
      ).toBigInt()
=======
            this._trapdoor = BigNumber.from(sha256(`${messageHash}identity_trapdoor`)).toBigInt()
            this._nullifier = BigNumber.from(sha256(`${messageHash}identity_nullifier`)).toBigInt()
            this._commitment = generateCommitment(this._nullifier, this._trapdoor)
>>>>>>> origin/main

      return
    }

    const [trapdoor, nullifier] = JSON.parse(identityOrMessage)

    this._trapdoor = BigNumber.from(`0x${trapdoor}`).toBigInt()
    this._nullifier = BigNumber.from(`0x${nullifier}`).toBigInt()
<<<<<<< HEAD
  }

  /**
   * Returns the chainID.
   * @returns The chainID.
   */
  public getChainID(): bigint {
    return this._chainID
=======
        this._commitment = generateCommitment(this._nullifier, this._trapdoor)
    }

    /**
     * Returns the identity trapdoor.
     * @returns The identity trapdoor.
     */
    public get trapdoor(): bigint {
        return this._trapdoor
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
    public get nullifier(): bigint {
        return this._nullifier
    }

    /**
     * Returns the identity nullifier.
     * @returns The identity nullifier.
     */
>>>>>>> origin/main
  public getNullifier(): bigint {
    return this._nullifier
  }

  /**
<<<<<<< HEAD
=======
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
     * @deprecated since version 2.6.0
>>>>>>> origin/main
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
<<<<<<< HEAD
    return JSON.stringify([
      this._trapdoor.toString(16),
      this._nullifier.toString(16)
    ])
=======
        return JSON.stringify([this._trapdoor.toString(16), this._nullifier.toString(16)])
>>>>>>> origin/main
  }
}
