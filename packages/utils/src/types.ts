/**
 * @module Types
 * This module provides utility functions to check data types.
 * It defines a set of supported types and includes functions to check if
 * a value is defined and if it matches a supported type. These functions
 * are useful for type checking and validation in the other libraries,
 * enhancing code robustness and reliability.
 */

// The list of types supported by this utility functions.
const supportedTypes = ["number", "string", "function", "array", "uint8array", "object", "bigint"] as const

// Type extracted from the list above.
export type SupportedType = (typeof supportedTypes)[number]

/**
 * It returns true if the value is defined, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isDefined(value: any): boolean {
    return typeof value !== "undefined"
}

/**
 * It returns true if the value is a number, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isNumber(value: any): boolean {
    return typeof value === "number"
}

/**
 * It returns true if the value is a string, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isString(value: any): boolean {
    return typeof value === "string"
}

/**
 * It returns true if the value is a function, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isFunction(value: any): boolean {
    return typeof value === "function"
}

/**
 * It returns true if the value is an array, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isArray(value: any): boolean {
    return typeof value === "object" && Array.isArray(value)
}

/**
 * It returns true if the value is a uint8array, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isUint8Array(value: any): boolean {
    return value instanceof Uint8Array
}

/**
 * It returns true if the value is an object, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isObject(value: any): boolean {
    return typeof value === "object"
}

/**
 * It returns true if the value is a bigint, false otherwise.
 * @param value The value to be checked.
 * @returns True or false.
 */
export function isBigInt(value: any): boolean {
    return typeof value === "bigint"
}

/**
 * It returns true if the value type is the same as the type passed
 * as the second parameter, false otherwise.
 * @param type The expected type.
 * @returns True or false.
 */
export function isType(value: any, type: SupportedType): boolean {
    switch (type) {
        case "number":
            return isNumber(value)
        case "string":
            return isString(value)
        case "function":
            return isFunction(value)
        case "array":
            return isArray(value)
        case "uint8array":
            return isUint8Array(value)
        case "object":
            return isObject(value)
        case "bigint":
            return isBigInt(value)
        default:
            return false
    }
}

/**
 * Return true if the type is being supported by this utility
 * functions, false otherwise.
 * @param type The type to be checked.
 * @returns True or false
 */
export function isSupportedType(type: string): type is SupportedType {
    return (supportedTypes as readonly string[]).includes(type)
}
