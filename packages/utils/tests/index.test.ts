import { encodeBytes32String } from "ethers/abi"
import { toBigInt } from "ethers/utils"
import { supportedNetworks } from "../src"
import decodeMessage from "../src/decode-message"

describe("Utils", () => {
    describe("# supportedNetworks", () => {
        it("Should be a list of networks supported by Semaphore", () => {
            expect(supportedNetworks).toBeInstanceOf(Array)
            expect(typeof supportedNetworks[0]).toBe("string")
        })
    })

    describe("# decodeMessage", () => {
        it("Should decode a text message previously encoded to 32-byte bigint", () => {
            const message = "Hello World"
            const encodedMessage = toBigInt(encodeBytes32String(message))

            const decodedMessage = decodeMessage(encodedMessage)

            expect(decodedMessage).toBe(message)
        })
    })
})
