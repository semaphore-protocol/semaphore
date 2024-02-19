import { errors, types } from "../src"

describe("Utils", () => {
    describe("# types", () => {
        it("Should return true if the value is a number", () => {
            expect(types.isNumber(1)).toBeTruthy()
        })

        it("Should return false if the value is not a number", () => {
            expect(types.isNumber("string")).toBeFalsy()
        })

        it("Should return true if the value is a string", () => {
            expect(types.isString("string")).toBeTruthy()
        })

        it("Should return false if the value is not a string", () => {
            expect(types.isString(1)).toBeFalsy()
        })

        it("Should return true if the value is a function", () => {
            expect(types.isFunction(() => true)).toBeTruthy()
        })

        it("Should return false if the value is not a function", () => {
            expect(types.isFunction(1)).toBeFalsy()
        })

        it("Should return true if the value is an array", () => {
            expect(types.isArray([])).toBeTruthy()
        })

        it("Should return false if the value is not an array", () => {
            expect(types.isArray(1)).toBeFalsy()
        })

        it("Should return true if the value is an uint8array", () => {
            expect(types.isUint8Array(new Uint8Array([]))).toBeTruthy()
        })

        it("Should return false if the value is not an uint8array", () => {
            expect(types.isArray(1)).toBeFalsy()
        })

        it("Should return true if the value type is the one expected", () => {
            expect(types.isType(1, "number")).toBeTruthy()
            expect(types.isType("string", "string")).toBeTruthy()
            expect(types.isType(() => true, "function")).toBeTruthy()
            expect(types.isType([], "array")).toBeTruthy()
            expect(types.isType(new Uint8Array([]), "uint8array")).toBeTruthy()
        })

        it("Should return false if the value type is not the one expected or is not supported", () => {
            expect(types.isType("string", "number")).toBeFalsy()
            expect(types.isType(1, "string")).toBeFalsy()
            expect(types.isType(1, "function")).toBeFalsy()
            expect(types.isType(1, "array")).toBeFalsy()
            expect(types.isType(1, "uint8array")).toBeFalsy()
            expect(types.isType(1, "type" as any)).toBeFalsy()
        })

        it("Should return true if the type is supported", () => {
            expect(types.isSupportedType("number")).toBeTruthy()
        })

        it("Should return false if the type is not supported", () => {
            expect(types.isSupportedType("type")).toBeFalsy()
        })
    })

    describe("# errors", () => {
        it("Should throw an error if the parameter is not defined", () => {
            const fun = () => errors.requireDefined(undefined as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not defined")
        })

        it("Should not throw an error if the parameter is defined", () => {
            const fun = () => errors.requireDefined(1, "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is not a number", () => {
            const fun = () => errors.requireNumber("euo" as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not a number")
        })

        it("Should not throw an error if the parameter is a number", () => {
            const fun = () => errors.requireNumber(1, "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is not a string", () => {
            const fun = () => errors.requireString(1 as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not a string")
        })

        it("Should not throw an error if the parameter is a string", () => {
            const fun = () => errors.requireString("string", "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is not an array", () => {
            const fun = () => errors.requireArray(1 as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not an array")
        })

        it("Should not throw an error if the parameter is an array", () => {
            const fun = () => errors.requireArray([], "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is not a uint8array", () => {
            const fun = () => errors.requireUint8Array([] as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not a Uint8Array")
        })

        it("Should not throw an error if the parameter is a uint8array", () => {
            const fun = () => errors.requireUint8Array(new Uint8Array([]), "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is not a function", () => {
            const fun = () => errors.requireFunction(1 as any, "parameter")

            expect(fun).toThrow("Parameter 'parameter' is not a function")
        })

        it("Should not throw an error if the parameter is a function", () => {
            const fun = () => errors.requireFunction(() => true, "parameter")

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter is neither a function nor a number", () => {
            const fun = () => errors.requireTypes("string", "parameter", ["function", "number"])

            expect(fun).toThrow("Parameter 'parameter' is none of the following types: function, number")
        })

        it("Should not throw an error if the parameter is either a string or an array", () => {
            const fun = () => errors.requireTypes("string", "parameter", ["string", "array"])

            expect(fun).not.toThrow()
        })

        it("Should throw an error if the parameter types are not supported", () => {
            const fun = () => errors.requireTypes("string", "parameter", ["string", "type" as any])

            expect(fun).toThrow("Type 'type' is not supported")
        })
    })
})
