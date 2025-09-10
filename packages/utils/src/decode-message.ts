import { BigNumberish, decodeBytes32String, toBeHex } from "ethers"

/**
 * Typically used for decoding on-chain Semaphore messages.
 * When Semaphore messages are text they are converted to bigints before
 * the proof is generated (and eventually sent on-chain).
 * This function help devs converting bigint messages to text again.
 * If the original message was not text the output of this
 * function won't probably be human-readable text.
 *
 * Note: If the input is not a valid bytes32 string, the function will return null instead of throwing.
 * This makes the function safer to use with untrusted or dynamic input.
 *
 * @param message The Semaphore message as a bigint.
 * @returns The Semaphore message as a text, or null if decoding fails.
 */
export default function decodeMessage(message: BigNumberish) {
    try {
        // Attempt to decode the message as a bytes32 string.
        // If the input is not valid, return null instead of throwing an error.
        return decodeBytes32String(toBeHex(message, 32))
    } catch {
        // Decoding failed (invalid input or not a valid bytes32 string)
        return null
    }
}
