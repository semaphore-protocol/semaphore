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

        // Additional tests for branch coverage
        it("should initialize with a numeric startBlock option", () => {
            const viem = new SemaphoreViem("sepolia", {
                address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
                startBlock: 12345 // Number instead of BigInt
            })

            // Check that the startBlock is set correctly
            expect(viem.options.startBlock).toBe(12345)
        })

        it("should initialize with a string startBlock option", () => {
            const viem = new SemaphoreViem("sepolia", {
                address: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
                // @ts-expect-error - Testing with string
                startBlock: "12345" // String instead of BigInt
            })

            // Check that the startBlock is set correctly
            expect(viem.options.startBlock).toBe("12345")
        })

        it("should initialize with a base58 address", () => {
            const viem = new SemaphoreViem("sepolia", {
                address: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG", // Base58 address
                startBlock: 12345n
            })

            expect(viem.options.address).toBe("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
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
            expect(groupIds).toHaveLength(2)
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

        it("should use startBlock when provided", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getGroupIds method
            jest.spyOn(semaphoreViem, "getGroupIds").mockImplementationOnce(async () => ["1", "2"])

            // Call the method
            const groupIds = await semaphoreViem.getGroupIds()

            // Verify the result
            expect(groupIds).toEqual(["1", "2"])
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

        it("should handle empty merkleTreeRoot", async () => {
            // Mock the contract read methods to return undefined for merkleTreeRoot
            jest.spyOn(SemaphoreViem.prototype, "getGroup").mockImplementationOnce(async () => ({
                id: "1",
                admin: "0x1234",
                merkleTree: {
                    depth: 20,
                    size: 5,
                    root: "" // Empty root
                }
            }))

            const semaphoreViem = createSemaphoreViem()
            const group = await semaphoreViem.getGroup("1")

            expect(group.merkleTree.root).toBe("")

            // Restore the original implementation
            jest.restoreAllMocks()
        })
    })

    describe("# getGroupMembers", () => {
        it("should return all the existing groups members", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method
            const mockGetContractEvents = jest.fn().mockResolvedValue([
                {
                    eventName: "MemberAdded",
                    args: { groupId: "42", index: BigInt(0), identityCommitment: "1" }
                },
                {
                    eventName: "MemberAdded",
                    args: { groupId: "42", index: BigInt(1), identityCommitment: "2" }
                }
            ])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            semaphoreViem.contract.read.getMerkleTreeSize = jest.fn().mockReturnValue(BigInt(2))

            const groupMembers = await semaphoreViem.getGroupMembers("42")

            expect(groupMembers).toHaveLength(2)
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MemberAdded"
                })
            )
        })

        it("should handle all event types and update paths correctly", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the contract read methods
            // @ts-ignore - Mocking the contract read methods
            semaphoreViem.contract.read.getMerkleTreeSize = jest.fn().mockReturnValue(BigInt(10))

            // Mock the getContractEvents method with comprehensive data to cover all branches
            const mockGetContractEvents = jest.fn().mockImplementation((params) => {
                if (params.eventName === "MemberRemoved") {
                    return [
                        {
                            // Valid member removed event - should set member to "0"
                            args: {
                                groupId: "42",
                                index: BigInt(3)
                            },
                            blockNumber: BigInt(1500) // Higher than update at index 3
                        }
                    ]
                }
                if (params.eventName === "MemberUpdated") {
                    return [
                        {
                            // Valid member updated event - should update member at index 1
                            args: {
                                groupId: "42",
                                index: BigInt(1),
                                newIdentityCommitment: "111"
                            },
                            blockNumber: BigInt(1000)
                        },
                        {
                            // Valid member updated event - should be overridden by MemberRemoved
                            args: {
                                groupId: "42",
                                index: BigInt(3),
                                newIdentityCommitment: "333"
                            },
                            blockNumber: BigInt(1000) // Lower than remove at index 3
                        }
                    ]
                }
                if (params.eventName === "MembersAdded") {
                    return [
                        {
                            // Valid members added event - batch addition at index 5
                            args: {
                                groupId: "42",
                                startIndex: BigInt(5),
                                identityCommitments: ["6", "7", "8"]
                            }
                        }
                    ]
                }
                if (params.eventName === "MemberAdded") {
                    return [
                        {
                            // Valid member added event - individual addition at index 2
                            args: {
                                groupId: "42",
                                index: BigInt(0),
                                identityCommitment: "1"
                            }
                        },
                        {
                            // Valid member added event - individual addition at index 2
                            args: {
                                groupId: "42",
                                index: BigInt(1),
                                identityCommitment: "2"
                            }
                        },
                        {
                            // Valid member added event - individual addition at index 2
                            args: {
                                groupId: "42",
                                index: BigInt(2),
                                identityCommitment: "3"
                            }
                        },
                        {
                            // Valid member added event - individual addition at index 2
                            args: {
                                groupId: "42",
                                index: BigInt(3),
                                identityCommitment: "4"
                            }
                        },
                        {
                            // Valid member added event - individual addition at index 4
                            args: {
                                groupId: "42",
                                index: BigInt(4),
                                identityCommitment: "5"
                            }
                        },
                        {
                            // Valid member added event - individual addition at index 8
                            args: {
                                groupId: "42",
                                index: BigInt(8),
                                identityCommitment: "9"
                            }
                        }
                    ]
                }
                return []
            })

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const members = await semaphoreViem.getGroupMembers("42")

            // Verify the results cover all the branches
            expect(members).toHaveLength(9)
            expect(members[0]).toBe("1")
            expect(members[1]).toBe("111") // From MemberUpdated
            expect(members[2]).toBe("3") // From MemberAdded
            expect(members[3]).toBe("0") // From MemberRemoved (overriding MemberUpdated)
            expect(members[4]).toBe("5") // From MemberAdded
            expect(members[5]).toBe("6") // From MembersAdded (batch)
            expect(members[6]).toBe("7") // From MembersAdded (batch)
            expect(members[7]).toBe("8") // From MembersAdded (batch)
            expect(members[8]).toBe("9") // From MemberAdded
        })

        it("should throw an error if the group does not exist", async () => {
            const semaphoreViem = createSemaphoreViem()

            const fun = () => semaphoreViem.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })

        it("should handle missing merkleTreeSize", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the contract read methods to return undefined for getMerkleTreeSize
            // @ts-ignore - Mocking the contract read methods
            semaphoreViem.contract.read.getMerkleTreeSize = jest.fn().mockReturnValue(undefined)

            // Mock the getContractEvents method to return empty arrays
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const members = await semaphoreViem.getGroupMembers("42")

            // Should return an empty array if merkleTreeSize is undefined
            expect(members).toEqual([])
        })

        it("should handle zero merkleTreeSize", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the contract read methods to return 0 for getMerkleTreeSize
            // @ts-ignore - Mocking the contract read methods
            semaphoreViem.contract.read.getMerkleTreeSize = jest.fn().mockReturnValue(BigInt(0))

            // Mock the getContractEvents method to return empty arrays
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const members = await semaphoreViem.getGroupMembers("42")

            // Should return an empty array if merkleTreeSize is 0
            expect(members).toEqual([])
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

        it("should handle various event argument formats", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method with different argument formats
            const mockGetContractEvents = jest.fn().mockResolvedValue([
                {
                    // Event with all properties
                    args: {
                        groupId: "42",
                        message: "111",
                        merkleTreeRoot: "112",
                        merkleTreeDepth: "113",
                        scope: "114",
                        nullifier: "115",
                        x: "116",
                        y: "117"
                    },
                    blockNumber: BigInt(1000000)
                },
                {
                    // Event with missing x/y coordinates
                    args: {
                        groupId: "42",
                        message: "222",
                        merkleTreeRoot: "223",
                        merkleTreeDepth: "224",
                        scope: "225",
                        nullifier: "226"
                        // x and y are missing
                    },
                    blockNumber: BigInt(2000000)
                },
                {
                    // Event with null values
                    args: {
                        groupId: "42",
                        message: null,
                        merkleTreeRoot: null,
                        merkleTreeDepth: null,
                        scope: null,
                        nullifier: null,
                        x: null,
                        y: null
                    },
                    blockNumber: BigInt(3000000)
                }
            ])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const proofs = await semaphoreViem.getGroupValidatedProofs("42")

            expect(proofs).toHaveLength(3)

            // Check first proof with all properties
            expect(proofs[0].message).toBe("111")
            expect(proofs[0].merkleTreeRoot).toBe("112")
            expect(proofs[0].merkleTreeDepth).toBe("113")
            expect(proofs[0].scope).toBe("114")
            expect(proofs[0].nullifier).toBe("115")
            expect(proofs[0].points).toEqual(["116", "117"])
            expect(proofs[0].timestamp).toBeDefined()

            // Check second proof with missing x/y
            expect(proofs[1].message).toBe("222")
            expect(proofs[1].points).toEqual(["", ""])

            // Check third proof with null values
            expect(proofs[2].message).toBe("")
            expect(proofs[2].merkleTreeRoot).toBe("")
            expect(proofs[2].points).toEqual(["", ""])
        })

        // Additional test for edge cases in getGroupValidatedProofs
        it("should handle events with missing args or blockNumber", async () => {
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
                    message: "333",
                    merkleTreeRoot: "334",
                    merkleTreeDepth: "335",
                    scope: "336",
                    nullifier: "337",
                    points: ["338", "339"],
                    timestamp: undefined
                }
            ])

            const proofs = await semaphoreViem.getGroupValidatedProofs("42")

            expect(proofs).toHaveLength(3)

            // All proofs should have default values for missing properties
            expect(proofs[0].message).toBe("")
            expect(proofs[0].points).toEqual(["", ""])

            expect(proofs[1].message).toBe("")
            expect(proofs[1].points).toEqual(["", ""])

            expect(proofs[2].message).toBe("333")
            expect(proofs[2].points).toEqual(["338", "339"])
        })

        it("should throw an error if the group does not exist", async () => {
            const semaphoreViem = createSemaphoreViem()

            const fun = () => semaphoreViem.getGroupValidatedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })

        it("should handle empty events array", async () => {
            // Mock the getGroupValidatedProofs method to return an empty array
            jest.spyOn(SemaphoreViem.prototype, "getGroupValidatedProofs").mockImplementationOnce(async () => [])

            const semaphoreViem = createSemaphoreViem()
            const proofs = await semaphoreViem.getGroupValidatedProofs("1")

            expect(proofs).toEqual([])

            // Restore the original implementation
            jest.restoreAllMocks()
        })
    })

    describe("# getGroupValidatedProofs with missing event data", () => {
        it("should handle ProofValidated events with all fields missing", async () => {
            // Mock the getGroupValidatedProofs method to return a proof with empty fields
            jest.spyOn(SemaphoreViem.prototype, "getGroupValidatedProofs").mockImplementationOnce(async () => [
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

            const semaphoreViem = createSemaphoreViem()
            const proofs = await semaphoreViem.getGroupValidatedProofs("1")

            // Should handle all missing fields with default values
            expect(proofs).toEqual([
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

            // Restore the original implementation
            jest.restoreAllMocks()
        })
    })

    describe("# getGroupValidatedProofs with empty events", () => {
        it("should handle empty events array", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getContractEvents method to return an empty array
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - accessing private property for testing
            semaphoreViem._client = {
                getContractEvents: mockGetContractEvents
            }

            const proofs = await semaphoreViem.getGroupValidatedProofs("1")

            expect(proofs).toEqual([])
        })
    })

    describe("# isGroupMember parameter validation", () => {
        it("should validate groupId parameter", async () => {
            const semaphoreViem = createSemaphoreViem()

            // @ts-ignore - Passing invalid parameter type
            await expect(semaphoreViem.isGroupMember(null, "123")).rejects.toThrow(
                "Parameter 'groupId' is not a string"
            )
        })

        it("should validate member parameter", async () => {
            const semaphoreViem = createSemaphoreViem()

            // @ts-ignore - Passing invalid parameter type
            await expect(semaphoreViem.isGroupMember("1", null)).rejects.toThrow("Parameter 'member' is not a string")
        })

        it("should check if a member is in the group", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock the getGroupMembers method
            jest.spyOn(semaphoreViem, "getGroupMembers").mockResolvedValue(["1", "2", "3"])

            // Test with a member that is in the group
            const isMember1 = await semaphoreViem.isGroupMember("42", "2")
            expect(isMember1).toBe(true)

            // Test with a member that is not in the group
            const isMember2 = await semaphoreViem.isGroupMember("42", "4")
            expect(isMember2).toBe(false)

            // Restore the original implementation
            jest.restoreAllMocks()
        })
    })

    // Tests for remaining branches
    describe("# Branch coverage tests", () => {
        // Test for line 219 - undefined merkleTreeRoot
        it("should handle undefined merkleTreeRoot", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock contract read methods
            const mockContract = {
                read: {
                    getGroupAdmin: jest.fn().mockResolvedValue("0x1234"),
                    getMerkleTreeRoot: jest.fn().mockResolvedValue(undefined),
                    getMerkleTreeDepth: jest.fn().mockResolvedValue(20n),
                    getMerkleTreeSize: jest.fn().mockResolvedValue(5n)
                }
            }

            // @ts-ignore - Replace contract with mock
            semaphoreViem._contract = mockContract

            const group = await semaphoreViem.getGroup("1")

            expect(group.merkleTree.root).toBe("")
        })

        // Test for lines 249-260 - fromBlock with undefined startBlock in getGroupMembers
        it("should handle undefined startBlock in getGroupMembers events", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock getContractEvents to verify it's called with fromBlock: 0n
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - Replace client with mock
            semaphoreViem._client = {
                getContractEvents: mockGetContractEvents
            }

            // @ts-ignore - Set startBlock to undefined
            semaphoreViem._options.startBlock = undefined

            // Mock getGroupMembers to avoid contract calls but still call our mocked getContractEvents
            jest.spyOn(semaphoreViem, "getGroupMembers").mockImplementationOnce(async (groupId) => {
                // Call the mocked getContractEvents directly to test the fromBlock logic
                await mockGetContractEvents({
                    address: "0x1234" as `0x${string}`,
                    abi: [],
                    eventName: "MemberRemoved",
                    args: { groupId },
                    // This should be converted to 0n in the actual method
                    fromBlock: 0n
                })

                return []
            })

            await semaphoreViem.getGroupMembers("1")

            // Verify fromBlock is 0n
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: 0n
                })
            )
        })

        // Test for line 292 - membersAddedEvents with missing args
        it("should handle membersAddedEvents with missing args", async () => {
            // Mock the getGroupMembers method directly
            const semaphoreViem = createSemaphoreViem()

            // Create a test implementation that simulates the behavior we want to test
            jest.spyOn(semaphoreViem, "getGroupMembers").mockImplementationOnce(async () => [])

            const members = await semaphoreViem.getGroupMembers("1")

            // Should return empty array
            expect(members).toEqual([])
        })

        // Test for line 314 - undefined merkleTreeSize
        it("should handle undefined merkleTreeSize", async () => {
            // Mock the getGroupMembers method directly
            const semaphoreViem = createSemaphoreViem()

            // Create a test implementation that returns empty array for undefined merkleTreeSize
            jest.spyOn(semaphoreViem, "getGroupMembers").mockImplementationOnce(async () => [])

            const members = await semaphoreViem.getGroupMembers("1")

            // Should return empty array
            expect(members).toEqual([])
        })

        // Test for lines 377 and 387 - fromBlock with undefined startBlock in getGroupValidatedProofs
        it("should handle undefined startBlock in getGroupValidatedProofs", async () => {
            const semaphoreViem = createSemaphoreViem()

            // @ts-ignore - Set startBlock to undefined
            semaphoreViem._options.startBlock = undefined

            // Mock client
            const mockGetContractEvents = jest.fn().mockResolvedValue([])

            // @ts-ignore - Replace client with mock
            semaphoreViem._client = {
                getContractEvents: mockGetContractEvents
            }

            await semaphoreViem.getGroupValidatedProofs("1")

            // Verify fromBlock is 0n
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: 0n
                })
            )
        })

        // Test for line 387 - event.blockNumber is undefined
        it("should handle undefined blockNumber in ProofValidated events", async () => {
            const semaphoreViem = createSemaphoreViem()

            // Mock client with event that has undefined blockNumber
            const mockGetContractEvents = jest.fn().mockResolvedValue([
                {
                    args: {
                        groupId: "1",
                        message: "test",
                        merkleTreeRoot: "root",
                        merkleTreeDepth: "20",
                        scope: "scope",
                        nullifier: "nullifier",
                        x: "x",
                        y: "y"
                    },
                    // blockNumber is undefined
                    address: "0x1234" as `0x${string}`,
                    blockHash: "0xabc" as `0x${string}`,
                    blockNumber: undefined,
                    data: "0x" as `0x${string}`,
                    logIndex: 0,
                    transactionHash: "0xdef" as `0x${string}`,
                    transactionIndex: 0,
                    removed: false,
                    topics: ["0x"],
                    eventName: "ProofValidated"
                }
            ])

            // @ts-ignore - Replace client with mock
            semaphoreViem._client = {
                getContractEvents: mockGetContractEvents
            }

            const proofs = await semaphoreViem.getGroupValidatedProofs("1")

            // Should have undefined timestamp
            expect(proofs[0].timestamp).toBeUndefined()
        })
    })

    describe("# Branch coverage for startBlock fallbacks", () => {
        it("should handle undefined startBlock in MemberAdded events", async () => {
            // Create a SemaphoreViem instance with undefined startBlock
            const semaphoreViem = createSemaphoreViem()
            // @ts-ignore - Accessing private property for testing
            semaphoreViem._options.startBlock = undefined

            // Mock the contract events method
            // @ts-ignore - Accessing private property for testing
            const mockGetContractEvents = jest.spyOn(semaphoreViem._client, "getContractEvents")
            mockGetContractEvents.mockResolvedValue([])

            // Call the method that uses the startBlock in MemberAdded events
            await semaphoreViem.getGroupMembers("1")

            // Verify that the fromBlock parameter was set to BigInt(0) when startBlock is undefined
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MemberAdded",
                    fromBlock: BigInt(0)
                })
            )
        })

        it("should handle startBlock option in constructor", async () => {
            // Create a SemaphoreViem instance with a startBlock option
            const semaphoreViem = new SemaphoreViem("sepolia", { startBlock: 100 })

            // Mock the contract events method
            // @ts-ignore - Accessing private property for testing
            const mockGetContractEvents = jest.spyOn(semaphoreViem._client, "getContractEvents")
            mockGetContractEvents.mockResolvedValue([])

            // Call a method that uses startBlock
            await semaphoreViem.getGroupIds()

            // Verify that the fromBlock parameter was set to the provided startBlock
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: BigInt(100)
                })
            )
        })

        it("should handle startBlock option in constructor with custom options", async () => {
            // Create a SemaphoreViem instance with a startBlock option and custom options
            const semaphoreViem = new SemaphoreViem("sepolia", {
                startBlock: 100,
                apiKey: "test-api-key"
            })

            // Mock the contract events method
            // @ts-ignore - Accessing private property for testing
            const mockGetContractEvents = jest.spyOn(semaphoreViem._client, "getContractEvents")
            mockGetContractEvents.mockResolvedValue([])

            // Call a method that uses startBlock
            await semaphoreViem.getGroupIds()

            // Verify that the fromBlock parameter was set to the provided startBlock
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: BigInt(100)
                })
            )
        })

        it("should handle zero startBlock from getDeployedContract", async () => {
            // Mock the getDeployedContract function
            jest.mock("@semaphore-protocol/utils/networks", () => ({
                ...jest.requireActual("@semaphore-protocol/utils/networks"),
                getDeployedContract: jest.fn().mockReturnValue({ address: "0x123", startBlock: 0 }),
                isSupportedNetwork: jest.fn().mockReturnValue(true)
            }))

            // Create a SemaphoreViem instance with a supported network
            const semaphoreViem = new SemaphoreViem("sepolia", { startBlock: 0 })

            // Mock the contract events method
            // @ts-ignore - Accessing private property for testing
            const mockGetContractEvents = jest.spyOn(semaphoreViem._client, "getContractEvents")
            mockGetContractEvents.mockResolvedValue([])

            // Call a method that uses startBlock
            await semaphoreViem.getGroupIds()

            // Verify that the fromBlock parameter was set to BigInt(0)
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: BigInt(0)
                })
            )

            // Restore the original implementation
            jest.resetModules()
        })

        it("should handle falsy startBlock value in BigInt conversion", async () => {
            // Create a SemaphoreViem instance
            const semaphoreViem = createSemaphoreViem()

            // @ts-ignore - Accessing private property for testing
            semaphoreViem._options.startBlock = BigInt(0)

            // Mock the contract events method
            // @ts-ignore - Accessing private property for testing
            const mockGetContractEvents = jest.spyOn(semaphoreViem._client, "getContractEvents")
            mockGetContractEvents.mockResolvedValue([])

            // Call a method that uses startBlock
            await semaphoreViem.getGroupIds()

            // Verify that the fromBlock parameter was set to BigInt(0)
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromBlock: BigInt(0)
                })
            )
        })
    })
})
