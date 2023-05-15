import request from "./request"
import SemaphoreSubgraph from "./subgraph"

jest.mock("./request", () => ({
    __esModule: true,
    default: jest.fn()
}))

const requestMocked = request as jest.MockedFunction<typeof request>

describe("SemaphoreSubgraph", () => {
    let semaphore: SemaphoreSubgraph

    describe("# SemaphoreSubgraph", () => {
        it("Should instantiate a SemaphoreSubgraph object", () => {
            semaphore = new SemaphoreSubgraph()
            const semaphore1 = new SemaphoreSubgraph("arbitrum")

            expect(semaphore.url).toContain("sepolia")
            expect(semaphore1.url).toContain("arbitrum")
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
                                zeroValue: 0,
                                numberOfLeaves: 2,
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
                    zeroValue: 0,
                    numberOfLeaves: 2,
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
                                zeroValue: 0,
                                numberOfLeaves: 2,
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
                            verifiedProofs: [
                                {
                                    signal: "0x3243b",
                                    merkleTree: "1332132",
                                    externalNullifier: "14324",
                                    nullifierHash: "442342",
                                    timestamp: "1657306917"
                                },
                                {
                                    signal: "0x5233a",
                                    merkleTree: "1332132",
                                    externalNullifier: "14324",
                                    nullifierHash: "442342",
                                    timestamp: "1657306923"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroups({
                members: true,
                verifiedProofs: true
            })

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    zeroValue: 0,
                    numberOfLeaves: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                members: ["1", "2"],
                verifiedProofs: [
                    {
                        signal: "0x3243b",
                        merkleTree: "1332132",
                        externalNullifier: "14324",
                        nullifierHash: "442342",
                        timestamp: "1657306917"
                    },
                    {
                        signal: "0x5233a",
                        merkleTree: "1332132",
                        externalNullifier: "14324",
                        nullifierHash: "442342",
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
                                zeroValue: 0,
                                numberOfLeaves: 2,
                                root: "2"
                            },
                            admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroups({
                filters: {
                    admin: "0x7bcd6f009471e9974a77086a69289d16eadba286"
                }
            })

            expect(expectedValue).toBeDefined()
            expect(Array.isArray(expectedValue)).toBeTruthy()
            expect(expectedValue).toContainEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    zeroValue: 0,
                    numberOfLeaves: 2,
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
                                zeroValue: 0,
                                numberOfLeaves: 2,
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
                    zeroValue: 0,
                    numberOfLeaves: 2,
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
                                zeroValue: 0,
                                numberOfLeaves: 2,
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
                            verifiedProofs: [
                                {
                                    signal: "0x3243b",
                                    merkleTree: "1332132",
                                    externalNullifier: "14324",
                                    nullifierHash: "442342",
                                    timestamp: "1657306917"
                                },
                                {
                                    signal: "0x5233a",
                                    merkleTree: "1332132",
                                    externalNullifier: "14324",
                                    nullifierHash: "442342",
                                    timestamp: "1657306923"
                                }
                            ]
                        }
                    ]
                })
            )

            const expectedValue = await semaphore.getGroup("1", {
                members: true,
                verifiedProofs: true
            })

            expect(expectedValue).toBeDefined()
            expect(expectedValue).toEqual({
                id: "1",
                merkleTree: {
                    depth: 20,
                    zeroValue: 0,
                    numberOfLeaves: 2,
                    root: "2"
                },
                admin: "0x7bcd6f009471e9974a77086a69289d16eadba286",
                members: ["1", "2"],
                verifiedProofs: [
                    {
                        signal: "0x3243b",
                        merkleTree: "1332132",
                        externalNullifier: "14324",
                        nullifierHash: "442342",
                        timestamp: "1657306917"
                    },
                    {
                        signal: "0x5233a",
                        merkleTree: "1332132",
                        externalNullifier: "14324",
                        nullifierHash: "442342",
                        timestamp: "1657306923"
                    }
                ]
            })
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
