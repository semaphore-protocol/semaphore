import { encodeBytes32String } from "ethers/abi"
import { toBigInt } from "ethers/utils"
import decodeMessage from "../src/decode-message"
import { getDeployedContract, isSupportedNetwork } from "../src/networks"

describe("Utils", () => {
    describe("# isSupportedNetwork", () => {
        it("Should return true if the network is supported", () => {
            expect(isSupportedNetwork("sepolia")).toBeTruthy()
        })

        it("Should return false if the network is not supported", () => {
            expect(isSupportedNetwork("hello")).toBeFalsy()
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
