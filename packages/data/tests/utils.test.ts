import { jsDateToGraphqlDate } from "../src/utils"

describe("Utils", () => {
    describe("# jsDateToGraphqlDate", () => {
        it("Should convert a JS date to the GraphQL date", async () => {
            const date = jsDateToGraphqlDate(new Date("2020-01-01"))

            expect(date).toBe(1577836800)
        })
        it.each([
            ["2020-01-01T00:00:00.499Z", 1577836800],
            ["2020-01-01T00:00:00.500Z", 1577836800],
            ["2020-01-01T00:00:00.999Z", 1577836800],
            ["1969-12-31T23:59:59.999Z", -1]
        ])("Should preserve the Unix second containing %s", (timestamp, expected) => {
            expect(jsDateToGraphqlDate(new Date(timestamp))).toBe(expected)
        })
    })
})
