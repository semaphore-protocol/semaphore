import { encodeBytes32String } from "ethers/abi"
import { toBigInt } from "ethers/utils"
import decodeMessage from "../src/decode-message"
import { getDeployedContract, supportedNetworks } from "../src/networks"

describe("Utils", () => {
    describe("# supportedNetworks", () => {
        it("Should be a list of networks supported by Semaphore", () => {
            expect(supportedNetworks).toBeInstanceOf(Array)
            expect(typeof supportedNetworks[0]).toBe("string")
        })
    })

    describe("# getDeployedContract", () => {
        it("Should return Semaphore deployment data for Sepolia", () => {
            const { address, startBlock } = getDeployedContract("sepolia")

            expect(address).toHaveLength(42)
            expect(typeof startBlock).toBe("number")
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
