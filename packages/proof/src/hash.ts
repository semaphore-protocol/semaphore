import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable, zeroPad } from "@ethersproject/bytes"
import { keccak256 } from "@ethersproject/keccak256"

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(message: BytesLike | Hexable | number | bigint): bigint {
    message = BigNumber.from(message).toTwos(256).toHexString()
    message = zeroPad(message, 32)

    return BigInt(keccak256(message)) >> BigInt(8)
}
