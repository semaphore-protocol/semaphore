import SemaphoreEthers from "./ethers"
import getEvents from "./getEvents"

jest.mock("./getEvents", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("@ethersproject/contracts", () => ({
    __esModule: true,
    Contract: jest.fn(
        () =>
            ({
                getMerkleTreeRoot: () => "222",
                getNumberOfMerkleTreeLeaves: () => ({
                    toNumber: () => 2
                })
            } as any)
    )
}))

const getEventsMocked = getEvents as jest.MockedFunction<typeof getEvents>

describe("SemaphoreEthers", () => {
    let semaphore: SemaphoreEthers

    describe("# SemaphoreEthers", () => {
        it("Should instantiate a SemaphoreEthers object with different networks", () => {
            semaphore = new SemaphoreEthers()
            const semaphore1 = new SemaphoreEthers("arbitrum")
            const semaphore2 = new SemaphoreEthers("mumbai")
            const semaphore3 = new SemaphoreEthers("optimism-goerli")
            const semaphore4 = new SemaphoreEthers("arbitrum-goerli")
            const semaphore5 = new SemaphoreEthers("arbitrum-goerli", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })
            const semaphore6 = new SemaphoreEthers("homestead", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })

            expect(semaphore.network).toBe("sepolia")
            expect(semaphore.contract).toBeInstanceOf(Object)
            expect(semaphore1.network).toBe("arbitrum")
            expect(semaphore2.network).toBe("maticmum")
            expect(semaphore3.network).toBe("optimism-goerli")
            expect(semaphore4.network).toBe("arbitrum-goerli")
            expect(semaphore5.options.address).toContain("0x000000")
            expect(semaphore6.network).toBe("homestead")
            expect(semaphore6.options.startBlock).toBe(0)
            expect(semaphore6.options.address).toContain("0x000000")
        })

        it("Should instantiate a SemaphoreEthers object with different providers", () => {
            const semaphore1 = new SemaphoreEthers("homestead", {
                provider: "infura",
                address: "0x0000000000000000000000000000000000000000",
                apiKey: "1234567890"
            })
            const semaphore2 = new SemaphoreEthers("homestead", {
                provider: "etherscan",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore3 = new SemaphoreEthers("homestead", {
                provider: "alchemy",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore4 = new SemaphoreEthers("homestead", {
                provider: "cloudflare",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore5 = new SemaphoreEthers("homestead", {
                provider: "pocket",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore6 = new SemaphoreEthers("homestead", {
                provider: "ankr",
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(semaphore1.options.provider).toBe("infura")
            expect(semaphore1.options.apiKey).toBe("1234567890")
            expect(semaphore2.options.provider).toBe("etherscan")
            expect(semaphore3.options.provider).toBe("alchemy")
            expect(semaphore4.options.provider).toBe("cloudflare")
            expect(semaphore5.options.provider).toBe("pocket")
            expect(semaphore6.options.provider).toBe("ankr")
        })

        it("Should instantiate a SemaphoreEthers object with a custom URL", () => {
            const semaphore1 = new SemaphoreEthers("http://localhost:8545", {
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(semaphore1.network).toBe("http://localhost:8545")
        })

        it("Should throw an error if the network is not supported by Semaphore yet and there's no address", () => {
            const fun = () => new SemaphoreEthers("homestead")

            expect(fun).toThrow("You should provide a Semaphore contract address for this network")
        })

        it("Should throw an error if the provider is not supported", () => {
            const fun = () =>
                new SemaphoreEthers("goerli", {
                    provider: "hello" as any
                })

            expect(fun).toThrow("Provider 'hello' is not supported")
        })
    })

    describe("# getGroupIds", () => {
        it("Should return all the existing groups", async () => {
            getEventsMocked.mockReturnValueOnce(Promise.resolve([["32"], ["42"]]))

            const groupIds = await semaphore.getGroupIds()

            expect(groupIds).toContain("42")
        })
    })

    describe("# getGroup", () => {
        it("Should return a specific group", async () => {
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        merkleTreeDepth: "20",
                        zeroValue: "111"
                    }
                ])
            )

            const group = await semaphore.getGroup("42")

            expect(group.merkleTree.depth).toBe("20")
            expect(group.merkleTree.root).toBe("222")
            expect(group.merkleTree.zeroValue).toContain("111")
        })

        it("Should throw an error if the group does not exist", async () => {
            getEventsMocked.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroup("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupAdmin", () => {
        it("Should return a group admin", async () => {
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        newAdmin: "0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F"
                    }
                ])
            )

            const admin = await semaphore.getGroupAdmin("42")

            expect(admin).toBe("0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F")
        })

        it("Should throw an error if the group does not exist", async () => {
            getEventsMocked.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupAdmin("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupMembers", () => {
        it("Should return a list of group members", async () => {
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        merkleTreeDepth: "20",
                        zeroValue: "0"
                    }
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        index: "0",
                        merkleTreeRoot: "223",
                        blockNumber: 3
                    },
                    {
                        index: "2",
                        merkleTreeRoot: "224",
                        blockNumber: 4
                    }
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        index: "1",
                        newIdentityCommitment: "113",
                        merkleTreeRoot: "225",
                        blockNumber: 3
                    },
                    {
                        index: "2",
                        newIdentityCommitment: "114",
                        merkleTreeRoot: "226",
                        blockNumber: 3
                    }
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        index: "0",
                        identityCommitment: "110",
                        merkleTreeRoot: "220",
                        blockNumber: 0
                    },
                    {
                        index: "1",
                        identityCommitment: "111",
                        merkleTreeRoot: "221",
                        blockNumber: 1
                    },
                    {
                        index: "2",
                        identityCommitment: "112",
                        merkleTreeRoot: "222",
                        blockNumber: 2
                    },
                    {
                        index: "3",
                        identityCommitment: "113",
                        merkleTreeRoot: "223",
                        blockNumber: 3
                    }
                ])
            )

            const members = await semaphore.getGroupMembers("42")

            expect(members[0]).toBe("0")
            expect(members[1]).toBe("113")
            expect(members[2]).toBe("0")
        })

        it("Should throw an error if the group does not exist", async () => {
            getEventsMocked.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupVerifiedProofs", () => {
        it("Should return a list of group verified proofs", async () => {
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        merkleTreeDepth: "20",
                        zeroValue: "0"
                    }
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    {
                        signal: "111",
                        merkleTreeRoot: "112",
                        externalNullifier: "113",
                        nullifierHash: "114"
                    }
                ])
            )

            const [verifiedProof] = await semaphore.getGroupVerifiedProofs("42")

            expect(verifiedProof.signal).toContain("111")
        })

        it("Should throw an error if the group does not exist", async () => {
            getEventsMocked.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupVerifiedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })
})
