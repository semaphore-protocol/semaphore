/* istanbul ignore file */
import { bytesToBigint } from "./bytes-to-bigint"

export function randomNumber(): bigint {
    const bytes = crypto.getRandomValues(new Uint8Array(32))

    return bytesToBigint(bytes)
}
