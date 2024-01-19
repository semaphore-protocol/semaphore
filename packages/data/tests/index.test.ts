import getSupportedNetworks from "../src/getSupportedNetworks"

describe("Data", () => {
    describe("# getSupportedNetworks", () => {
        it("Should return a list of supported networks", () => {
            const supportedNetworks = getSupportedNetworks()

            expect(supportedNetworks).toHaveLength(5)
            expect(supportedNetworks).toContain("sepolia")
        })
    })
})
