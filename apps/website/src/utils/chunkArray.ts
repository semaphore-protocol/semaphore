/**
 * This function takes an array and divides it into smaller arrays,
 * or "chunks", each containing a specified number of elements.
 * @param array The array to be split into chunks.
 * @param size The size of each chunk. The default size is 15.
 * @returns An array containing smaller subarrays (chunks), each with a length defined by the size.
 */
export function chunkArray(array: any[], size = 15): any[] {
    const result = []

    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size)

        result.push(chunk)
    }

    return result.length === 0 ? [[]] : result
}
