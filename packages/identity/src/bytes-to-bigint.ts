export function bytesToBigint(bytes: Uint8Array): bigint {
    let hex = "0x"

    for (let i = 0; i < bytes.length; i += 1) {
        hex += bytes[i].toString(16).padStart(2, "0")
    }

    return BigInt(hex)
}
