import request from "../src/request"
import SemaphoreSubgraph from "../src/subgraph"

jest.mock("../src/request", () => ({
    __esModule: true,
    default: jest.fn()
}))

const requestMocked = request as jest.MockedFunction<typeof request>

describe("SemaphoreSubgraph", () => {
    let semaphore: SemaphoreSubgraph

    describe("# SemaphoreSubgraph", () => {
        it("Should instantiate a SemaphoreSubgraph object", () => {
            semaphore = new SemaphoreSubgraph()

            expect(semaphore.url).toContain("sepolia")
        })

        it("Should instantiate a SemaphoreSubgraph object using URL", () => {
            const url = "https://api.studio.thegraph.com/query/14377/semaphore-arbitrum/v3.2.0"
            const semaphore1 = new SemaphoreSubgraph(url)

            expect(semaphore1.url).toBe(url)
        })

        it("Should throw an error if there is a wrong network", () => {
            const fun = () => new SemaphoreSubgraph("wrong" as any)

            expect(fun).toThrow("Network 'wrong' is not supported")
        })

        it("Should throw an error if the networkOrSubgraphURL parameter type is wrong", () => {
            const fun = () => new SemaphoreSubgraph(33 as any)

            expect(fun).toThrow("Parameter 'networkOrSubgraphURL' is not a string")
        })
    })

    describe("# getGroupIds", () => {
        it("Should return all the existing group ids", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1"
                        },
                        {
                            id: "2"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroupIds()

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual("1")
        })
    })

    describe("# getGroups", () => {
        it("Should return all the existing groups", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroups()

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    size: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
            })
        })

        it("Should throw an error if the options parameter type is wrong", async () => {
            const fun = () => semaphore.getGroups(1 as any)

            await expect(fun).rejects.toThrow("Parameter 'options' is not an object")
        })

        it("Should return all the existing groups with their members and verified proofs", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            members: [
                                {
                                    identityCommitment: "1"
                                },
                                {
                                    identityCommitment: "2"
                                }
                            ],
                            validatedProofs: [
                                {
                                    message: "0x3243b",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306917"
                                },
                                {
                                    message: "0x5233a",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306923"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroups({
                members: true,
                validatedProofs: true
            })

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    size: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                members: ["1", "2"],
                validatedProofs: [
                    {
                        message: "0x3243b",
                        merkleTreeRoot: "1332132",
                        merkleTreeDepth: "32",
                        scope: "14324",
                        nullifier: "442342",
                        points: ["442342"],
                        timestamp: "1657306917"
                    },
                    {
                        message: "0x5233a",
                        merkleTreeRoot: "1332132",
                        merkleTreeDepth: "32",
                        scope: "14324",
                        nullifier: "442342",
                        points: ["442342"],
                        timestamp: "1657306923"
                    }
                ]
            })
        })

        it("Should return groups by applying filters", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroups({
                filters: {
                    admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                    identityCommitment: "123"
                }
            })

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    size: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
            })
        })
    })

    describe("# getGroup", () => {
        it("Should return a specific group", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroup("1")

            expect(expectedValue).toBeDefined()
            expect(expectedValue).toEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    size: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
            })
        })

        it("Should throw an error if the options parameter type is wrong", async () => {
            const fun = () => semaphore.getGroup("1", 1 as any)

            await expect(fun).rejects.toThrow("Parameter 'options' is not an object")
        })

        it("Should return a specific group with its members and verified proofs", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            members: [
                                {
                                    identityCommitment: "1"
                                },
                                {
                                    identityCommitment: "2"
                                }
                            ],
                            validatedProofs: [
                                {
                                    message: "0x3243b",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306917"
                                },
                                {
                                    message: "0x5233a",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306923"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroup("1", {
                members: true,
                validatedProofs: true
            })

            expect(expectedValue).toBeDefined()
            expect(expectedValue).toEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    size: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                members: ["1", "2"],
                validatedProofs: [
                    {
                        message: "0x3243b",
                        merkleTreeRoot: "1332132",
                        merkleTreeDepth: "32",
                        scope: "14324",
                        nullifier: "442342",
                        points: ["442342"],
                        timestamp: "1657306917"
                    },
                    {
                        message: "0x5233a",
                        merkleTreeRoot: "1332132",
                        merkleTreeDepth: "32",
                        scope: "14324",
                        nullifier: "442342",
                        points: ["442342"],
                        timestamp: "1657306923"
                    }
                ]
            })
        })

        it("Should exclude members with zero identityCommitment when getting group with members", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 3,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            members: [
                                {
                                    identityCommitment: "20"
                                },
                                {
                                    identityCommitment: "17"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroup("1", { members: true })

            expect(expectedValue).toBeDefined()
            expect(expectedValue.members).toBeDefined()
            expect(Array.isArray(expectedValue.members)).toBeTruthy()
            expect(expectedValue.members).toHaveLength(2)
            expect(expectedValue.members).toContain("20")
            expect(expectedValue.members).toContain("17")
            expect(expectedValue.members).not.toContain("0")

            // Verify that the GraphQL query includes the filter for non-zero identityCommitment
            expect(requestMocked).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    data: expect.stringContaining('members(where: { identityCommitment_not: \\"0\\" }, orderBy: index)')
                })
            )
        })
    })

    describe("# getGroupMembers", () => {
        it("Should return a list of group members", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            members: [
                                {
                                    identityCommitment: "20"
                                },
                                {
                                    identityCommitment: "17"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroupMembers("1")

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue[0]).toBe("20")
            expect(expectedValue[1]).toBe("17")
        })

        it("Should throw an error if the groupId parameter type is wrong", async () => {
            const fun = () => semaphore.getGroupMembers(1 as any)
            await expect(fun).rejects.toThrow("Parameter 'groupId' is not a string")
        })

        it("Should exclude members with zero identityCommitment (removed members)", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 3,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            members: [
                                {
                                    identityCommitment: "20"
                                },
                                {
                                    identityCommitment: "17"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroupMembers("1")

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toHaveLength(2)
            expect(expectedValue).toContain("20")
            expect(expectedValue).toContain("17")
            expect(expectedValue).not.toContain("0")
        })
    })

    describe("# getGroupValidatedProofs", () => {
        it("Should return a list of group validated proofs", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1",
                            merkleTree: {
                                depth: 20,
                                size: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                            validatedProofs: [
                                {
                                    message: "0x3243b",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306917"
                                },
                                {
                                    message: "0x5233a",
                                    merkleTreeRoot: "1332132",
                                    merkleTreeDepth: "32",
                                    scope: "14324",
                                    nullifier: "442342",
                                    points: ["442342"],
                                    timestamp: "1657306923"
                                }
                            ]
                        }
                    ]
                })
            )
            const expectedValue = await semaphore.getGroupValidatedProofs("1")

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue[0]).toEqual({
                message: "0x3243b",
                merkleTreeRoot: "1332132",
                merkleTreeDepth: "32",
                scope: "14324",
                nullifier: "442342",
                points: ["442342"],
                timestamp: "1657306917"
            })
            expect(expectedValue[1]).toEqual({
                message: "0x5233a",
                merkleTreeRoot: "1332132",
                merkleTreeDepth: "32",
                scope: "14324",
                nullifier: "442342",
                points: ["442342"],
                timestamp: "1657306923"
            })
        })

        it("Should throw an error if the groupId parameter type is wrong", async () => {
            const fun = () => semaphore.getGroupValidatedProofs(1 as any)
            await expect(fun).rejects.toThrow("Parameter 'groupId' is not a string")
        })
    })

    describe("# isGroupMember", () => {
        it("Should throw an error if the member parameter type is wrong", async () => {
            const fun = () => semaphore.isGroupMember("1", 1 as any)

            await expect(fun).rejects.toThrow("Parameter 'member' is not a string")
        })

        it("Should return true if a group member exist", async () => {
            requestMocked.mockImplementationOnce(() =>
                Promise.resolve({
                    groups: [
                        {
                            id: "1"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.isGroupMember(
                "1",
                "19759682999141591121829027463339362582441675980174830329241909768001406603165"
            )

            expect(expectedValue).toBeTruthy()
        })
    })
})
