import { encodeBytes32String, toBigInt as _toBigInt } from "ethers"
import { BigNumberish } from "./types"

export default function toBigInt(value: BigNumberish | Uint8Array | string): bigint {
    try {
        return _toBigInt(value)
    } catch (error: any) {
        if (typeof value === "string") {
            return _toBigInt(encodeBytes32String(value))
        }

        throw TypeError(error.message)
    }
}
