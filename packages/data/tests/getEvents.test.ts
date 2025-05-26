import { Contract, EventLog } from "ethers/contract"
import getEvents from "../src/getEvents"

jest.mock("ethers/contract", () => ({
    __esModule: true,
    Contract: jest.fn(),
    EventLog: jest.fn()
}))

describe("getEvents", () => {
    let mockContract: jest.Mocked<Contract>

    beforeEach(() => {
        mockContract = {
            filters: {
                TestEvent: jest.fn()
            },
            queryFilter: jest.fn()
        } as any
    })

    describe("# getEvents", () => {
        it("should fetch events with basic parameters", async () => {
            const mockEvents = [
                {
                    args: ["arg1", "arg2"],
                    blockNumber: 123
                },
                {
                    args: ["arg3", "arg4"],
                    blockNumber: 124
                }
            ] as EventLog[]

            mockContract.queryFilter.mockResolvedValueOnce(mockEvents)

            const result = await getEvents(mockContract, "TestEvent")

            expect(mockContract.filters.TestEvent).toHaveBeenCalled()
            expect(mockContract.queryFilter).toHaveBeenCalled()
            expect(result).toEqual([
                ["arg1", "arg2", 123],
                ["arg3", "arg4", 124]
            ])
        })

        it("should handle filter arguments", async () => {
            const filterArgs = ["arg1", "arg2"]
            const mockEvents = [
                {
                    args: ["arg1", "arg2"],
                    blockNumber: 123
                }
            ] as EventLog[]

            mockContract.queryFilter.mockResolvedValueOnce(mockEvents)

            await getEvents(mockContract, "TestEvent", filterArgs)

            expect(mockContract.filters.TestEvent).toHaveBeenCalledWith(...filterArgs)
        })

        it("should use startBlock parameter", async () => {
            const startBlock = 1000
            const mockEvents = [
                {
                    args: ["arg1"],
                    blockNumber: 1001
                }
            ] as EventLog[]

            mockContract.queryFilter.mockResolvedValueOnce(mockEvents)

            await getEvents(mockContract, "TestEvent", [], startBlock)

            expect(mockContract.queryFilter).toHaveBeenCalledWith(undefined, startBlock)
        })

        it("should handle empty events array", async () => {
            mockContract.queryFilter.mockResolvedValueOnce([])

            const result = await getEvents(mockContract, "TestEvent")

            expect(result).toEqual([])
        })

        it("should handle undefined filterArgs gracefully", async () => {
            const mockEvents = [
                {
                    args: ["arg1"],
                    blockNumber: 101
                }
            ] as EventLog[]

            mockContract.queryFilter.mockResolvedValueOnce(mockEvents)

            await getEvents(mockContract, "TestEvent", undefined)

            expect(mockContract.filters.TestEvent).toHaveBeenCalledWith()
        })

        it("should handle contract errors", async () => {
            mockContract.queryFilter.mockRejectedValue(new Error("Contract error"))

            await expect(getEvents(mockContract, "TestEvent")).rejects.toThrow("Contract error")
        })
    })
})
