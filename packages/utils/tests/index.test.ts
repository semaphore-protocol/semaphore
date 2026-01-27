import { encodeBytes32String } from "ethers/abi"
import { toBigInt } from "ethers/utils"
import decodeMessage from "../src/decode-message"
import { getDeployedContract, getHardhatNetworks, isSupportedNetwork, supportedNetworks } from "../src/networks"

describe("Utils", () => {
    describe("# networks", () => {
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

            it("Should throw an error if the network is not supported", () => {
                const fun = () => getDeployedContract("hello" as any)

                expect(fun).toThrow("Semaphore has not been deployed on 'hello' yet")
            })
        })

        describe("# getHardhatNetworks", () => {
            it("Should return an empty object if the private key is not defined", () => {
                const networks = getHardhatNetworks()

                expect(networks).toEqual({})
            })

            it("Should return a list of networks compatible with the Hardhat 'networks' object", () => {
                const networks = getHardhatNetworks("ec12f72ab17a2f14cf538a1a2455d6cd94ec99a90e8d8be591f987744b7b440f")

                expect(Object.keys(networks)).toEqual(Object.keys(supportedNetworks))
                expect(Object.keys(networks)).toHaveLength(Object.keys(supportedNetworks).length)
                expect(networks.sepolia.accounts).toHaveLength(1)
            })
        })
    })

    describe("# decodeMessage", () => {
        it("Should decode a text message previously encoded to 32-byte bigint", () => {
            const message = "Hello World"
            const encodedMessage = toBigInt(encodeBytes32String(message))

            const decodedMessage = decodeMessage(encodedMessage)

            expect(decodedMessage).toBe(message)
        })

        it("Should return hex if message is not a valid bytes32 string", () => {
            const hex = "0x66fdd5e25ef9ddb305ba3c2aae1856ab9c6f2979000000000000000000000000"
            const result = decodeMessage(hex)
            expect(result).toBe(hex)
        })
    })
})
