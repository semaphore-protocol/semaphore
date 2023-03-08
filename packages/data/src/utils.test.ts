import { jsDateToGraphqlDate } from "./utils"

describe("Utils", () => {
    describe("# jsDateToGraphqlDate", () => {
        it("Should convert a JS date to the GraphQL date", async () => {
            const date = jsDateToGraphqlDate(new Date("2020-01-01"))

            expect(date).toBe(1577836800)
        })
    })
})
