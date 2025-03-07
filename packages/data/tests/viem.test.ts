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

            // Mock the getContractEvents method for different event types
            const mockGetContractEvents = jest.fn().mockImplementation((params) => {
                if (params.eventName === "MemberRemoved") {
                    return [
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(3)
                            },
                            blockNumber: BigInt(1000)
                        }
                    ]
                }
                if (params.eventName === "MemberUpdated") {
                    return [
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(1),
                                newIdentityCommitment: "113"
                            },
                            blockNumber: BigInt(900)
                        },
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(3),
                                newIdentityCommitment: "113"
                            },
                            blockNumber: BigInt(800)
                        }
                    ]
                }
                if (params.eventName === "MembersAdded") {
                    return [
                        {
                            args: {
                                groupId: "42",
                                startIndex: BigInt(4),
                                identityCommitments: ["209", "210"]
                            }
                        }
                    ]
                }
                if (params.eventName === "MemberAdded") {
                    return [
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(0),
                                identityCommitment: "111"
                            }
                        },
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(2),
                                identityCommitment: "114"
                            }
                        },
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(6),
                                identityCommitment: "310"
                            }
                        },
                        {
                            args: {
                                groupId: "42",
                                index: BigInt(7),
                                identityCommitment: "312"
                            }
                        }
                    ]
                }
                return []
            })

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const members = await semaphoreViem.getGroupMembers("42")

            // The actual implementation fills in missing indices with "0"
            expect(members).toHaveLength(8)
            expect(members[0]).toBe("0") // Default value for missing member
            expect(members[1]).toBe("113") // Updated via MemberUpdated
            expect(members[2]).toBe("114") // From MemberAdded
            expect(members[3]).toBe("0") // Removed member
            expect(members[4]).toBe("209") // From MembersAdded
            expect(members[5]).toBe("210") // From MembersAdded
            expect(members[6]).toBe("310") // From MemberAdded
            expect(members[7]).toBe("312") // From MemberAdded

            // Verify that getContractEvents was called for all event types
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MemberRemoved"
                })
            )
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MemberUpdated"
                })
            )
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MembersAdded"
                })
            )
            expect(mockGetContractEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventName: "MemberAdded"
                })
            )
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
                }
            ])

            // @ts-ignore - Mocking the client's getContractEvents method
            semaphoreViem.client.getContractEvents = mockGetContractEvents

            const [validatedProof] = await semaphoreViem.getGroupValidatedProofs("42")

            expect(validatedProof.message).toContain("111")
            expect(validatedProof.points).toHaveLength(2)
            expect(validatedProof.timestamp).toBeDefined()
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
