import getSupportedNetworks from "./getSupportedNetworks"

describe("Data", () => {
    describe("# getSupportedNetworks", () => {
        it("Should return a list of supported networks", () => {
            const supportedNetworks = getSupportedNetworks()

            expect(supportedNetworks).toHaveLength(6)
            expect(supportedNetworks).toContain("sepolia")
        })
    })
})
