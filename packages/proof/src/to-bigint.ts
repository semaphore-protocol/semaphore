import { encodeBytes32String } from "ethers/abi"
import { toBigInt as _toBigInt } from "ethers/utils"
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
