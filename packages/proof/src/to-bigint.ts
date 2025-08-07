import type { BigNumberish } from "ethers"
import { encodeBytes32String } from "ethers/abi"
import { toBigInt as _toBigInt } from "ethers/utils"

/**
 * Converts a bignumberish or a text to a bigint.
 * @param value The value to be converted to bigint.
 * @return The value converted to bigint.
 */
export default function toBigInt(value: BigNumberish | Uint8Array | string): bigint {
    try {
        return _toBigInt(value)
    } catch (error: any) {
        if (typeof value === "string") {
            return _toBigInt(encodeBytes32String(value))
        }

        throw TypeError(error?.message || error.toString())
    }
}
