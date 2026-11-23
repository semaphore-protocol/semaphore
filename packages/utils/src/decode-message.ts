import type { BigNumberish } from "ethers"
import { decodeBytes32String } from "ethers/abi"
import { toBeHex } from "ethers/utils"

/**
 * Typically used for decoding on-chain Semaphore messages.
 * When Semaphore messages are text they are converted to bigints before
 * the proof is generated (and eventually sent on-chain).
 * This function help devs converting bigint messages to text again.
 * If the original message was not text the output of this
 * function won't probably be human-readable text.
 * @param message The Semaphore message as a bigint.
 * @returns The Semaphore message as a text.
 */
export default function decodeMessage(message: BigNumberish): string {
    const hex = toBeHex(message, 32)

    try {
        return decodeBytes32String(hex)
    } catch {
        return hex
    }
}
