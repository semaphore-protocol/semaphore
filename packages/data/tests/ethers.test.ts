/* eslint-disable no-sparse-arrays */
import { ZeroAddress } from "ethers/constants"
import { Contract } from "ethers/contract"
import SemaphoreEthers from "../src/ethers"
import getEvents from "../src/getEvents"

jest.mock("../src/getEvents", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("ethers/contract", () => ({
    __esModule: true,
    ...jest.requireActual("ethers/contract"),
    Contract: jest.fn(
        () =>
            ({
                getMerkleTreeRoot: () => "222",
                getMerkleTreeDepth: () => BigInt(3),
                getMerkleTreeSize: () => BigInt(8),
                getGroupAdmin: () => "0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F",
                hasMember: () => true
            }) as any
    )
}))

const getEventsMocked = getEvents as jest.MockedFunction<typeof getEvents>
const ContractMocked = Contract as jest.MockedClass<typeof Contract>

describe("SemaphoreEthers", () => {
    describe("# SemaphoreEthers", () => {
        it("Should instantiate a SemaphoreEthers object with different networks", () => {
            const semaphore = new SemaphoreEthers()
            const semaphore2 = new SemaphoreEthers("arbitrum-sepolia")
            const semaphore3 = new SemaphoreEthers("arbitrum-sepolia", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })
            const semaphore4 = new SemaphoreEthers("mainnet", {
                address: "0x0000000000000000000000000000000000000000",
                startBlock: 0
            })

            expect(semaphore.network).toBe("sepolia")
            expect(semaphore.contract).toBeInstanceOf(Object)
            expect(semaphore2.network).toBe("arbitrum-sepolia")
            expect(semaphore3.options.address).toContain("0x000000")
            expect(semaphore4.network).toBe("mainnet")
            expect(semaphore4.options.startBlock).toBe(0)
            expect(semaphore4.options.address).toContain("0x000000")
        })

        it("Should instantiate a SemaphoreEthers object with different providers", () => {
            const semaphore1 = new SemaphoreEthers("mainnet", {
                provider: "infura",
                address: "0x0000000000000000000000000000000000000000",
                apiKey: "1234567890"
            })
            const semaphore2 = new SemaphoreEthers("mainnet", {
                provider: "etherscan",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore3 = new SemaphoreEthers("mainnet", {
                provider: "alchemy",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore4 = new SemaphoreEthers("mainnet", {
                provider: "cloudflare",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore5 = new SemaphoreEthers("mainnet", {
                provider: "pocket",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore6 = new SemaphoreEthers("mainnet", {
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
            const fun = () => new SemaphoreEthers("mainnet")

            expect(fun).toThrow("Network 'mainnet' needs a Semaphore contract address")
        })

        it("Should throw an error if the provider is not supported", () => {
            const fun = () =>
                new SemaphoreEthers("sepolia", {
                    provider: "hello" as any
                })

            expect(fun).toThrow("Provider 'hello' is not supported")
        })
    })

    describe("# getGroupIds", () => {
        it("Should return all the existing groups", async () => {
            const semaphore = new SemaphoreEthers()

            getEventsMocked.mockReturnValueOnce(Promise.resolve([["32"], ["42"]]))

            const groupIds = await semaphore.getGroupIds()

            expect(groupIds).toContain("42")
        })
    })

    describe("# getGroup", () => {
        it("Should return a specific group", async () => {
            const semaphore = new SemaphoreEthers()

            const group = await semaphore.getGroup("42")

            expect(group.merkleTree.depth).toBe(3)
            expect(group.merkleTree.root).toBe("222")
            expect(group.merkleTree.size).toBe(8)
        })

        it("Should throw an error if the group does not exist", async () => {
            ContractMocked.mockReturnValueOnce({
                getGroupAdmin: () => ZeroAddress
            } as any)

            const semaphore = new SemaphoreEthers()

            const fun = () => semaphore.getGroup("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupMembers", () => {
        it("Should return a list of group members", async () => {
            const semaphore = new SemaphoreEthers()

            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    [, "0", , , 4],
                    [, "2", , , 5],
                    [, "5", , , 8]
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    [, "1", , "113", , 3],
                    [, "2", , "114", , 3]
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    [, "4", ["209", "211"]],
                    [, "6", ["310", "312"]]
                ])
            )
            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    [, , "110"],
                    [, , "111"],
                    [, , "112"],
                    [, , "113"]
                ])
            )

            const members = await semaphore.getGroupMembers("42")

            expect(members[0]).toBe("0")
            expect(members[1]).toBe("113")
            expect(members[2]).toBe("0")
            expect(members[4]).toBe("209")
            expect(members[5]).toBe("0")
            expect(members[7]).toBe("312")
        })

        it("Should throw an error if the group does not exist", async () => {
            ContractMocked.mockReturnValueOnce({
                getGroupAdmin: () => ZeroAddress
            } as any)

            const semaphore = new SemaphoreEthers()

            const fun = () => semaphore.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupVerifiedProofs", () => {
        it("Should return a list of group verified proofs", async () => {
            const semaphore = new SemaphoreEthers()

            getEventsMocked.mockReturnValueOnce(
                Promise.resolve([
                    [
                        ,
                        "112",
                        "112",
                        "114",
                        "111",
                        "113",
                        ["12312", "12312", "12312", "12312", "12312", "12312", "12312", "12312"]
                    ]
                ])
            )

            const [verifiedProof] = await semaphore.getGroupValidatedProofs("42")

            expect(verifiedProof.message).toContain("111")
        })

        it("Should throw an error if the group does not exist", async () => {
            ContractMocked.mockReturnValueOnce({
                getGroupAdmin: () => ZeroAddress
            } as any)

            const semaphore = new SemaphoreEthers()

            const fun = () => semaphore.getGroupValidatedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("isGroupMember", () => {
        it("Should return true because the member is part of the group", async () => {
            const semaphore = new SemaphoreEthers()

            const isMember = await semaphore.isGroupMember("42", "1")

            expect(isMember).toBeTruthy()
        })
        it("Should return false because the member is not part of the group", async () => {
            ContractMocked.mockReturnValueOnce({
                hasMember: () => false
            } as any)

            const semaphore = new SemaphoreEthers()

            const isMember = await semaphore.isGroupMember("48", "2")

            expect(isMember).toBeFalsy()
        })
    })

    describe("Event listeners", () => {
        let mockOn: jest.Mock
        let mockRemove: jest.Mock

        beforeEach(() => {
            mockOn = jest.fn()
            mockRemove = jest.fn()

            ContractMocked.mockImplementation(
                () =>
                    ({
                        on: mockOn,
                        removeAllListeners: mockRemove
                    }) as any
            )
        })

        it("onGroupCreated should call the callback with groupId and event", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onGroupCreated(cb)

            const handler = mockOn.mock.calls.find(([e]) => e === "GroupCreated")![1]
            const fakeEvent = { blockNumber: 123 }
            handler("42", fakeEvent)

            expect(cb).toHaveBeenCalledWith("42", fakeEvent)
            expect(mockOn).toHaveBeenCalledWith("GroupCreated", expect.any(Function))
        })

        it("offGroupCreated should remove all listeners for GroupCreated", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            semaphore.offGropupCreated()
            expect(mockRemove).toHaveBeenCalledWith("GroupCreated")
        })

        it("onMemberAdded should call callback with groupId, identityCommitment and event", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onMemberAdded(cb)
            const handler = mockOn.mock.calls.find(([e]) => e === "MemberAdded")![1]
            const fakeEvent = { txHash: "0xabc" }

            handler("group1", 0, "identity123", "root111", fakeEvent)

            expect(cb).toHaveBeenCalledWith("group1", "identity123", "root111", fakeEvent)
        })

        it("onMemberUpdated should call callback with groupId, old and new identity commitments", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onMemberUpdated(cb)
            const handler = mockOn.mock.calls.find(([e]) => e === "MemberUpdated")![1]
            const fakeEvent = { blockNumber: 200 }

            handler("groupX", 1, "old123", "new456", "root111", fakeEvent)

            expect(cb).toHaveBeenCalledWith("groupX", "old123", "new456", "root111", fakeEvent)
        })

        it("onMemberRemoved should call callback with groupId, identityCommitment and event", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onMemberRemoved(cb)
            const handler = mockOn.mock.calls.find(([e]) => e === "MemberRemoved")![1]
            const fakeEvent = { txHash: "0xdeadbeef" }

            handler("groupZ", 2, "identity999", "root111", fakeEvent)

            expect(cb).toHaveBeenCalledWith("groupZ", "identity999", "root111", fakeEvent)
        })

        it("offMemberAdded/Updated/Removed should remove all corresponding listeners", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })

            semaphore.offMemberAdded()
            semaphore.offMemberUpdated()
            semaphore.offMemberRemoved()

            expect(mockRemove).toHaveBeenCalledWith("MemberAdded")
            expect(mockRemove).toHaveBeenCalledWith("MemberUpdated")
            expect(mockRemove).toHaveBeenCalledWith("MemberRemoved")
        })

        it("onProofValidated should call callback with proof object", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onProofValidated(cb)
            const handler = mockOn.mock.calls.find(([e]) => e === "ProofValidated")![1]

            const fakeEvent = { blockNumber: 400 }
            handler("group1", 3, "root123", "nullifierXYZ", "msg1", "scope1", ["p1", "p2"], fakeEvent)

            expect(cb).toHaveBeenCalledWith({
                groupId: "group1",
                merkleTreeDepth: 3,
                merkleTreeRoot: "root123",
                nullifier: "nullifierXYZ",
                message: "msg1",
                scope: "scope1",
                points: ["p1", "p2"],
                event: fakeEvent
            })
        })

        it("offProofValidated should remove all ProofValidated listeners", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            semaphore.offProofValidated()
            expect(mockRemove).toHaveBeenCalledWith("ProofValidated")
        })

        it("onGroupAdminUpdated should call callback with groupId, oldAdmin, newAdmin and event", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            const cb = jest.fn()

            semaphore.onGroupAdminUpdated(cb)
            const handler = mockOn.mock.calls.find(([e]) => e === "GroupAdminUpdated")![1]
            const fakeEvent = { txHash: "0xbeef" }

            handler("0xOLD", "0xNEW", fakeEvent)

            expect(cb).toHaveBeenCalledWith("0xOLD", "0xNEW", fakeEvent)
        })

        it("offGroupAdminUpdated should remove all GroupAdminUpdated listeners", () => {
            const semaphore = new SemaphoreEthers("sepolia", { address: "0x0000" })
            semaphore.offGroupAdminUpdated()
            expect(mockRemove).toHaveBeenCalledWith("GroupAdminUpdated")
        })
    })
})
