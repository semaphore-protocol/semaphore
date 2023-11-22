import { arbitrum, arbitrumGoerli, goerli, localhost, optimismGoerli, polygon, sepolia } from "viem/chains"
import SemaphoreViem from "./viem"

jest.mock("viem", () => {
    const originalModule = jest.requireActual("viem")

    return {
        __esModule: true,
        ...originalModule,
        getContract: jest.fn((...args) => {
            const contract = originalModule.getContract(...args)
            return {
                ...contract,
                read: {
                    getMerkleTreeRoot: () => "222",
                    getNumberOfMerkleTreeLeaves: () => ({ toNumber: () => 2 })
                },
                getEvents: {
                    GroupCreated: jest.fn(),
                    GroupAdminUpdated: jest.fn(),
                    MemberRemoved: jest.fn(),
                    MemberUpdated: jest.fn(),
                    MemberAdded: jest.fn(),
                    ProofVerified: jest.fn()
                }
            }
        })
    }
})

describe("SemaphoreViem", () => {
    let semaphore: SemaphoreViem
    let contract: any

    beforeEach(() => {
        semaphore = new SemaphoreViem()
        contract = semaphore.contract
    })

    describe("# SemaphoreViem", () => {
        it("Should instantiate a SemaphoreEthers object with different networks", () => {
            const semaphore0 = new SemaphoreViem(goerli)
            const semaphore1 = new SemaphoreViem(arbitrum)
            const semaphore2 = new SemaphoreViem(polygon)
            const semaphore3 = new SemaphoreViem(optimismGoerli)
            const semaphore4 = new SemaphoreViem(arbitrumGoerli)
            const semaphore5 = new SemaphoreViem(arbitrumGoerli, {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })
            const semaphore6 = new SemaphoreViem(localhost, {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })

            expect(semaphore).toBeInstanceOf(SemaphoreViem)
            expect(semaphore.contract).toBeInstanceOf(Object)
            expect(semaphore.client).toBeInstanceOf(Object)
            expect(semaphore.options).toBeInstanceOf(Object)
            expect(semaphore.client.chain).toBe(sepolia)
            expect(semaphore0.client.chain).toBe(goerli)
            expect(semaphore1.client.chain).toBe(arbitrum)
            expect(semaphore2.client.chain).toBe(polygon)
            expect(semaphore3.client.chain).toBe(optimismGoerli)
            expect(semaphore4.client.chain).toBe(arbitrumGoerli)
            expect(semaphore5.contract.address).toContain("0x00000")
            expect(semaphore6.client.chain).toBe(localhost)
            expect(semaphore6.options.startBlock).toBe(0)
            expect(semaphore6.contract.address).toContain("0x00000")
        })

        it("Should instantiate a SemaphoreEthers object with different rpcUrl", () => {
            const semaphore0 = new SemaphoreViem(sepolia, { rpcURL: "http://localhost:8545" })

            expect(semaphore.client.transport.url).toBeUndefined()
            expect(semaphore0.client.transport.url).toBe("http://localhost:8545")
        })

        it("Should throw an error if the custom rpcUrl is invalid", () => {
            const fun = () => new SemaphoreViem(sepolia, { rpcURL: "hogehoge" })

            expect(fun).toThrow("Invalid rpcURL 'hogehoge'")

            const fun2 = () => new SemaphoreViem(sepolia, { rpcURL: { value: "NOT STRING" } as unknown as string })

            expect(fun2).toThrow("Parameter 'rpcURL' is not a string")
        })

        it("Should throw an error if the network is not supported by Semaphore yet and there's no address", () => {
            const fun = () => new SemaphoreViem(localhost)

            expect(fun).toThrow("You should provide a Semaphore contract address for this network")
        })
    })

    describe("# getMerkleTreeRoot", () => {
        it("Should return the merkle tree root", async () => {
            contract.getEvents.GroupCreated.mockResolvedValueOnce(
                Promise.resolve([{ args: { groupId: BigInt(32) } }, { args: { groupId: BigInt(42) } }])
            )

            const groupIds = await semaphore.getGroupIds()

            expect(groupIds).toContain("42")
            expect(groupIds).toContain("32")
        })
    })

    describe("# getGroup", () => {
        it("Should return a specific group", async () => {
            contract.getEvents.GroupCreated.mockResolvedValueOnce(
                Promise.resolve([{ args: { merkleTreeDepth: BigInt(20), zeroValue: BigInt(111) } }])
            )

            const group = await semaphore.getGroup("32")

            expect(group.id).toBe("32")
            expect(group.merkleTree.depth).toBe(20)
            expect(group.merkleTree.root).toBe("222")
            expect(group.merkleTree.zeroValue).toBe("111")
        })

        it("Should throw an error if the group does not exist", async () => {
            contract.getEvents.GroupCreated.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroup("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupAdmin", () => {
        it("Should return the group admin", async () => {
            contract.getEvents.GroupAdminUpdated.mockResolvedValueOnce(
                Promise.resolve([{ args: { newAdmin: "0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F" } }])
            )

            const groupAdmin = await semaphore.getGroupAdmin("42")
            expect(groupAdmin).toBe("0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F")
        })

        it("Should throw an error if the group does not exist", async () => {
            contract.getEvents.GroupAdminUpdated.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupAdmin("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupMembers", () => {
        it("Should return a list of group members", async () => {
            contract.getEvents.GroupCreated.mockResolvedValueOnce(
                Promise.resolve([{ args: { merkleTreeDepth: "20", zeroValue: "0" } }])
            )
            contract.getEvents.MemberRemoved.mockResolvedValueOnce(
                Promise.resolve([
                    { blockNumber: 3, args: { index: "0", merkleTreeRoot: "223" } },
                    { blockNumber: 4, args: { index: "2", merkleTreeRoot: "224" } }
                ])
            )
            contract.getEvents.MemberUpdated.mockResolvedValueOnce(
                Promise.resolve([
                    { blockNumber: 3, args: { index: "1", newIdentityCommitment: "113", merkleTreeRoot: "225" } },
                    { blockNumber: 3, args: { index: "2", newIdentityCommitment: "114", merkleTreeRoot: "226" } }
                ])
            )
            contract.getEvents.MemberAdded.mockResolvedValueOnce(
                Promise.resolve([
                    { blockNumber: 0, args: { index: "0", identityCommitment: "110", merkleTreeRoot: "220" } },
                    { blockNumber: 1, args: { index: "1", identityCommitment: "111", merkleTreeRoot: "221" } },
                    { blockNumber: 2, args: { index: "2", identityCommitment: "112", merkleTreeRoot: "222" } },
                    { blockNumber: 3, args: { index: "3", identityCommitment: "113", merkleTreeRoot: "223" } }
                ])
            )

            const members = await semaphore.getGroupMembers("42")

            expect(members[0]).toBe("0")
            expect(members[1]).toBe("113")
            expect(members[2]).toBe("0")
        })

        it("Should throw an error if the group does not exist", async () => {
            contract.getEvents.GroupCreated.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupVerifiedProofs", () => {
        it("Should return a list of group verified proofs", async () => {
            contract.getEvents.GroupCreated.mockResolvedValueOnce(
                Promise.resolve([{ args: { merkleTreeDepth: "20", zeroValue: "0" } }])
            )
            contract.getEvents.ProofVerified.mockResolvedValueOnce(
                Promise.resolve([
                    { args: { signal: "111", merkleTreeRoot: "112", externalNullifier: "113", nullifierHash: "114" } }
                ])
            )

            const [verifiedProof] = await semaphore.getGroupVerifiedProofs("42")
            expect(verifiedProof.signal).toBe("111")
        })

        it("Should throw an error if the group does not exist", async () => {
            contract.getEvents.GroupCreated.mockReturnValueOnce(Promise.resolve([]))

            const fun = () => semaphore.getGroupVerifiedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })
})
