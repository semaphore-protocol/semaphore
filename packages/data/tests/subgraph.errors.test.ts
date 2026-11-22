import axios from "axios"
import SemaphoreSubgraph from "../src/subgraph"

jest.mock("axios")

const axiosMocked = jest.mocked(axios)

describe("SemaphoreSubgraph response errors", () => {
    it("Should report the endpoint error when an archived subgraph returns no data", async () => {
        axiosMocked.mockResolvedValueOnce({ status: 200, data: { message: "Not found" } })

        const semaphore = new SemaphoreSubgraph("base")

        await expect(semaphore.getGroup("42")).rejects.toThrow("Subgraph response is missing query data: Not found")
    })

    it("Should report the GraphQL error when the response data is null", async () => {
        axiosMocked.mockResolvedValueOnce({ status: 200, data: { data: null, errors: [{ message: "Query failed" }] } })

        const semaphore = new SemaphoreSubgraph()

        await expect(semaphore.getGroupIds()).rejects.toThrow("Subgraph response is missing query data: Query failed")
    })

    it("Should report missing query data when the response contains no error message", async () => {
        axiosMocked.mockResolvedValueOnce({ status: 200, data: {} })

        const semaphore = new SemaphoreSubgraph()

        await expect(semaphore.getGroupIds()).rejects.toThrow("Subgraph response is missing query data")
    })

    it("Should return an empty result when the subgraph returns no matching groups", async () => {
        axiosMocked.mockResolvedValueOnce({ status: 200, data: { data: { groups: [] } } })

        const semaphore = new SemaphoreSubgraph()

        await expect(semaphore.getGroupIds()).resolves.toEqual([])
    })
})
