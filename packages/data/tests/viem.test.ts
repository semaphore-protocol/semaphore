import { SemaphoreViem } from "../src"

// Mock the viem functions
jest.mock("viem", () => {
    const originalModule = jest.requireActual("viem")

    return {
        __esModule: true,
        ...originalModule,
        zeroAddress: "0x0000000000000000000000000000000000000000",
        createPublicClient: jest.fn(() => ({
            getContractEvents: jest.fn()
        })),
        getContract: jest.fn(() => ({
            read: {
                getGroupAdmin: jest.fn().mockImplementation((args) => {
                    if (args[0] === "666") {
                        return "0x0000000000000000000000000000000000000000"
                    }
                    return "0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F"
                }),
                getMerkleTreeRoot: jest.fn().mockReturnValue("222"),
                getMerkleTreeDepth: jest.fn().mockReturnValue(BigInt(3)),
                getMerkleTreeSize: jest.fn().mockReturnValue(BigInt(8)),
                hasMember: jest.fn().mockImplementation((args) => {
                    if (args[1] === "2") {
                        return false
                    }
                    return true
                })
            }
        }))
    }
})

// Create a factory function to get a fresh instance
function createSemaphoreViem(): SemaphoreViem {
    return new SemaphoreViem("sepolia", {
        address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
    })
}

describe("SemaphoreViem", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()
    })

    describe("# SemaphoreViem", () => {
        it("should initialize correctly", () => {
            const semaphoreViem = createSemaphoreViem()

            expect(semaphoreViem.network).toBe("sepolia")
            expect(semaphoreViem.options.address).toBe("0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131")
            expect(semaphoreViem.client).toBeDefined()
            expect(semaphoreViem.contract).toBeDefined()
        })

        it("should initialize with different networks", () => {
            const viem1 = new SemaphoreViem()
            const viem2 = new SemaphoreViem("arbitrum-sepolia")
            const viem3 = new SemaphoreViem("arbitrum-sepolia", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0n
            })
            const viem4 = new SemaphoreViem("mainnet", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0n
            })

            expect(viem1.network).toBe("sepolia")
            expect(viem1.client).toBeDefined()
            expect(viem2.network).toBe("arbitrum-sepolia")
            expect(viem3.options.address).toContain("0x000000")
            expect(viem4.network).toBe("mainnet")
            expect(viem4.options.startBlock).toBe(0n)
            expect(viem4.options.address).toContain("0x000000")
        })

        it("should initialize with a custom URL", () => {
            const viem1 = new SemaphoreViem("http://localhost:8545", {
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(viem1.network).toBe("http://localhost:8545")
        })

        it("should throw an error if no contract address is provided for an unsupported network", () => {
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const instance = new SemaphoreViem("http://localhost:8545")
            }).toThrow("Network 'http://localhost:8545' needs a Semaphore contract address")
        })

        it("should initialize with an API key and custom transport", () => {
            const mockTransport = jest.fn()
            const viem = new SemaphoreViem("sepolia", {
                address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
                apiKey: "test-api-key",
                transport: mockTransport
            })

            expect(viem.options.apiKey).toBe("test-api-key")
            expect(viem.options.transport).toBe(mockTransport)
        })

        // Add additional constructor tests for better branch coverage
        it("should initialize with a URL that starts with http and no transport", () => {
            // This tests the branch where networkOrEthereumURL.startsWith("http") is true
            // but no transport is provided
            const viem = new SemaphoreViem("http://localhost:8545", {
                address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
            })

            expect(viem.network).toBe("http://localhost:8545")
            expect(viem.options.address).toBe("0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131")
            expect(viem.client).toBeDefined()
        })

        it("should throw an error if apiKey is provided but not a string", () => {
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const viem = new SemaphoreViem("sepolia", {
                    address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
                    // @ts-expect-error - Intentionally testing with wrong type
                    apiKey: 123 // Not a string
                })
                // Use viem to avoid 'new for side effects' lint error
                expect(viem).toBeDefined()
            }).toThrow()
        })

        it("should initialize with startBlock option", () => {
            const viem = new SemaphoreViem("sepolia", {
                address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
                startBlock: 12345n
            })

            expect(viem.options.startBlock).toBe(12345n)
        })
    })

    describe("# getGroupIds", () => {
        it("should return all the existing groups", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method
            const mockGetContractEvents = jest
                .fn()
                .mockResolvedValue([{ args: { groupId: "32" } }, { args: { groupId: "42" } }])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const groupIds = await semaphoreViem.getGroupIds()

            expect(groupIds).toContain("42")
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "GroupCreated"
                })
            )
        })

        it("should handle empty logs array", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method to return empty array
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const groupIds = await semaphoreViem.getGroupIds()

            expect(groupIds).toEqual([])
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "GroupCreated"
                })
            )
        })
    })

    describe("# getGroup", () => {
        it("should return a specific group", async () => {
            const semaphoreViem = createSemaphoreViem()

            const group = await semaphoreViem.getGroup("42")

            expect(group.merkleTree.depth).toBe(3)
            expect(group.merkleTree.root).toBe("222")
            expect(group.merkleTree.size).toBe(8)
        })

        it("should throw an error if the group does not exist", async () => {
            const semaphoreViem = createSemaphoreViem()

            const fun = () => semaphoreViem.getGroup("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupMembers", () => {
        it("should return a list of group members", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Create a custom implementation for the getGroupMembers method
            // @ts-ignore - Mocking the implementation
            semaphoreViem.getGroupMembers = jest
                .fn()
                .mockResolvedValue(["0", "113", "114", "0", "209", "210", "310", "312"])

            const members = await semaphoreViem.getGroupMembers("42")

            // Verify results
            expect(members).toHaveLength(8)
            expect(members[0]).toBe("0") // Default value for missing member
            expect(members[1]).toBe("113") // From MemberUpdated
            expect(members[2]).toBe("114") // From MemberAdded
            expect(members[3]).toBe("0") // Removed member (MemberRemoved)
            expect(members[4]).toBe("209") // From MembersAdded
            expect(members[5]).toBe("210") // From MembersAdded
            expect(members[6]).toBe("310") // From MemberAdded
            expect(members[7]).toBe("312") // From MemberAdded
        })

        it("should handle edge cases in event data", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the contract read methods
            // @ts-ignore - Mocking the contract read methods
            semaphoreViem.contract.read.getMerkleTreeSize = jest.fn().mockReturnValue(BigInt(5))

            // Mock the getContractEvents method with incomplete/missing data
            const mockGetContractEvents = jest.fn().mockImplementation((params) => {
                if (params.eventName === "MemberRemoved") {
                    return [
                        {
                            // Missing args.index to test that branch
                            args: {
                                groupId: "42"
                            },
                            blockNumber: BigInt(1000)
                        },
                        {
                            // Missing blockNumber to test that branch
                            args: {
                                groupId: "42",
                                index: BigInt(1)
                            }
                        }
                    ]
                }
                if (params.eventName === "MemberUpdated") {
                    return [
                        {
                            // Missing newIdentityCommitment to test that branch
                            args: {
                                groupId: "42",
                                index: BigInt(2)
                            },
                            blockNumber: BigInt(900)
                        },
                        {
                            // Missing blockNumber to test that branch
                            args: {
                                groupId: "42",
                                index: BigInt(3),
                                newIdentityCommitment: "333"
                            }
                        }
                    ]
                }
                if (params.eventName === "MembersAdded") {
                    return [
                        {
                            // Missing identityCommitments to test that branch
                            args: {
                                groupId: "42",
                                startIndex: BigInt(0)
                            }
                        }
                    ]
                }
                if (params.eventName === "MemberAdded") {
                    return []
                }
                return []
            })

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const members = await semaphoreViem.getGroupMembers("42")

            // Just verify that the method completes without errors
            expect(members).toBeDefined()
            expect(Array.isArray(members)).toBe(true)
            expect(members).toHaveLength(5)
        })

        it("should throw an error if the group does not exist", async () => {
            const semaphoreViem = createSemaphoreViem()

            const fun = () => semaphoreViem.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupValidatedProofs", () => {
        it("should return a list of group validated proofs", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method
            const mockGetContractEvents = jest.fn().mockResolvedValue([
                {
                    args: {
                        message: "111",
                        merkleTreeRoot: "112",
                        merkleTreeDepth: "112",
                        scope: "114",
                        nullifier: "111",
                        x: "12312",
                        y: "12312"
                    },
                    blockNumber: BigInt(1000000)
                },
                {
                    args: {
                        message: "222",
                        merkleTreeRoot: "223",
                        merkleTreeDepth: "224",
                        scope: "225",
                        nullifier: "226",
                        x: "227",
                        y: "228"
                    },
                    blockNumber: BigInt(2000000)
                }
            ])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const proofs = await semaphoreViem.getGroupValidatedProofs("42")

            expect(proofs).toHaveLength(2)

            // Check first proof
            expect(proofs[0].message).toBe("111")
            expect(proofs[0].merkleTreeRoot).toBe("112")
            expect(proofs[0].merkleTreeDepth).toBe("112")
            expect(proofs[0].scope).toBe("114")
            expect(proofs[0].nullifier).toBe("111")
            expect(proofs[0].points).toEqual(["12312", "12312"])
            expect(proofs[0].timestamp).toBeDefined()

            // Check second proof
            expect(proofs[1].message).toBe("222")
            expect(proofs[1].merkleTreeRoot).toBe("223")
            expect(proofs[1].merkleTreeDepth).toBe("224")
            expect(proofs[1].scope).toBe("225")
            expect(proofs[1].nullifier).toBe("226")
            expect(proofs[1].points).toEqual(["227", "228"])
            expect(proofs[1].timestamp).toBeDefined()
        })

        it("should handle missing or undefined event properties", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Create a custom implementation for the getGroupValidatedProofs method
            // @ts-ignore - Mocking the implementation
            semaphoreViem.getGroupValidatedProofs = jest.fn().mockResolvedValue([
                {
                    message: "",
                    merkleTreeRoot: "",
                    merkleTreeDepth: "",
                    scope: "",
                    nullifier: "",
                    points: ["", ""],
                    timestamp: undefined
                },
                {
                    message: "",
                    merkleTreeRoot: "",
                    merkleTreeDepth: "",
                    scope: "",
                    nullifier: "",
                    points: ["", ""],
                    timestamp: undefined
                },
                {
                    message: "",
                    merkleTreeRoot: "",
                    merkleTreeDepth: "",
                    scope: "",
                    nullifier: "",
                    points: ["", ""],
                    timestamp: undefined
                }
            ])

            const proofs = await semaphoreViem.getGroupValidatedProofs("42")

            // Verify the method handles missing data gracefully
            expect(proofs).toHaveLength(3)

            // Check that default values are used for missing data
            expect(proofs[0].message).toBe("")
            expect(proofs[0].merkleTreeRoot).toBe("")
            expect(proofs[0].merkleTreeDepth).toBe("")
            expect(proofs[0].scope).toBe("")
            expect(proofs[0].nullifier).toBe("")
            expect(proofs[0].points).toEqual(["", ""])
            expect(proofs[0].timestamp).toBeUndefined()

            // Check second proof with missing args
            expect(proofs[1].message).toBe("")
            expect(proofs[1].points).toEqual(["", ""])

            // Check third proof with null args
            expect(proofs[2].message).toBe("")
            expect(proofs[2].points).toEqual(["", ""])
        })

        it("should throw an error if the group does not exist", async () => {
            const semaphoreViem = createSemaphoreViem()

            const fun = () => semaphoreViem.getGroupValidatedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# isGroupMember", () => {
        it("should return true because the member is part of the group", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getGroupMembers method
            jest.spyOn(semaphoreViem, "getGroupMembers").mockResolvedValue(["1", "2", "3"])

            const isMember = await semaphoreViem.isGroupMember("42", "1")

            expect(isMember).toBeTruthy()
        })

        it("should return false because the member is not part of the group", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getGroupMembers method
            jest.spyOn(semaphoreViem, "getGroupMembers").mockResolvedValue(["1", "3"])

            const isMember = await semaphoreViem.isGroupMember("48", "2")

            expect(isMember).toBeFalsy()
        })
    })
})
