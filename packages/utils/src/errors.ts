/**
 * @module Errors
 * This module is designed to provide utility functions for validating
 * function parameters. It includes functions that throw type errors if
 * the parameters do not meet specified criteria, such as being defined,
 * a number, a string, a function, or an array. This module helps ensure
 * that functions receive the correct types of inputs, enhancing code
 * reliability and reducing runtime errors.
 */

import {
    SupportedType,
    isArray,
    isDefined,
    isFunction,
    isNumber,
    isObject,
    isString,
    isSupportedType,
    isType,
    isUint8Array
} from "./types"

/**
 * It throws a type error if the parameter value has not been defined.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireDefined(parameterValue: any, parameterName: string) {
    if (!isDefined(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not defined`)
    }
}

/**
 * It throws a type error if the parameter value is not a number.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireNumber(parameterValue: number, parameterName: string) {
    if (!isNumber(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not a number`)
    }
}

/**
 * It throws a type error if the parameter value is not a string.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireString(parameterValue: string, parameterName: string) {
    if (!isString(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not a string`)
    }
}

/**
 * It throws a type error if the parameter value is not a function.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireFunction(parameterValue: Function, parameterName: string) {
    if (!isFunction(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not a function`)
    }
}

/**
 * It throws a type error if the parameter value is not an array.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireArray(parameterValue: any[], parameterName: string) {
    if (!isArray(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not an array`)
    }
}

/**
 * It throws a type error if the parameter value is not a uint8array.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireUint8Array(parameterValue: Uint8Array, parameterName: string) {
    if (!isUint8Array(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not a Uint8Array`)
    }
}

/**
 * It throws a type error if the parameter value is not an object.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireObject(parameterValue: object, parameterName: string) {
    if (!isObject(parameterValue)) {
        throw new TypeError(`Parameter '${parameterName}' is not an object`)
    }
}

/**
 * It throws a type error if the parameter value type is not part of the list of types.
 * @param parameterValue The parameter value.
 * @param parameterName The parameter name.
 */
export function requireTypes(parameterValue: any, parameterName: string, types: SupportedType[]) {
    for (const type of types) {
        if (!isSupportedType(type)) {
            throw new Error(`Type '${type}' is not supported`)
        }
    }

    for (const type of types) {
        if (isType(parameterValue, type)) {
            return
        }
    }

    throw new TypeError(`Parameter '${parameterName}' is none of the following types: ${types.join(", ")}`)
}
