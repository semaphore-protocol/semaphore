/**
 * Check if the parameter type is correct.
 * @param value Parameter value.
 * @param name Parameter name.
 * @param type Expected parameter type.
 */
export default function checkParameter(value: any, name: string, type: string) {
    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not ${type === "object" ? "an" : "a"} ${type}`)
    }
}
