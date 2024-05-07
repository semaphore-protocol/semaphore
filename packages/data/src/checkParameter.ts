/**
 * Validates the type of a given parameter against an expected type.
 * Throws a {@link TypeError} if the validation fails.
 * This function is useful for ensuring that function arguments conform to expected types at runtime.
 * @param value The value of the parameter to check.
 * @param name The name of the parameter, used in the error message for easier debugging.
 * @param type The expected JavaScript type as a string (e.g., 'string', 'number', 'object').
 * @throws {TypeError} Throws an error if the type of `value` does not match the `type`.
 */
export default function checkParameter(value: any, name: string, type: string) {
    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not ${type === "object" ? "an" : "a"} ${type}`)
    }
}
