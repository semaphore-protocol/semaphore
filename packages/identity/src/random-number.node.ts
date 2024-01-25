import { randomBytes } from "node:crypto"

export function randomNumber(): bigint {
    const bytes = randomBytes(32)

    const hex = `0x${bytes.toString("hex")}`

    return BigInt(hex)
}
