/**
 * Converts a JavaScript Date object into a Unix timestamp.
 * @param date The Date object to convert.
 * @returns The Unix timestamp equivalent of the provided Date object.
 */
// eslint-disable-next-line import/prefer-default-export
export function jsDateToGraphqlDate(date: Date): number {
    return Math.round(date.getTime() / 1000)
}
